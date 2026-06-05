import os
import asyncio
import aiohttp
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse
from report_generator import PDFReport
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from supabase import create_client, Client

# Import Engine Modules
from spider import Spider
from scanner import VulnerabilityScanner
from dotenv import load_dotenv

load_dotenv()

# --- Config ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("[✓] Supabase Connected")
else:
    print("[!] Warning: Supabase Credentials missing. Using in-memory storage.")

# In-memory fallback storage
scan_results: Dict[str, Any] = {}

app = FastAPI(title="Scancrypt API", version="2.0")

# CORS - Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class ScanRequest(BaseModel):
    url: str
    max_pages: int = 10
    login_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    auth_mode: str = "none"
    stealth_mode: bool = False
    user_id: Optional[str] = None
    session_cookies: Optional[List[Dict[str, str]]] = None  # [{name, value}, ...]

class ScanResponse(BaseModel):
    scan_id: str
    status: str
    target: str

# --- Helper Functions ---
def save_finding_to_db(scan_id: str, finding: dict):
    """Save individual finding to Supabase"""
    if not supabase:
        return
    try:
        supabase.table("vulnerabilities").insert({
            "scan_id": scan_id,
            "name": finding.get("name"),
            "severity": finding.get("severity"),
            "url": finding.get("url"),
            "evidence": finding.get("evidence"),
            "param": finding.get("param"),
            "payload": finding.get("payload"),
            "cwe": finding.get("cwe"),
            "description": finding.get("description"),
            "remediation": finding.get("remediation"),
        }).execute()
    except Exception as e:
        print(f"[!] Failed to save finding: {e}")

# --- Core Scan Logic ---
async def run_scan(scan_id: str, target_url: str, max_pages: int, 
                   login_url: str, username: str, password: str, 
                   auth_mode: str, stealth_mode: bool,
                   session_cookies: List[Dict[str, str]] = None):
    """
    Main scan workflow:
    1. Crawl target with Spider
    2. Scan each URL with VulnerabilityScanner
    3. Save findings to DB
    """
    print(f"[INIT] Starting scan {scan_id} for {target_url}")
    
    # Initialize in-memory store
    scan_results[scan_id] = {
        "status": "Running",
        "target_url": target_url,
        "crawled_urls": [],
        "findings": [],
        "started_at": datetime.utcnow().isoformat()
    }
    
    session = None
    try:
        # Update DB status
        if supabase:
            supabase.table("scans").update({
                "status": "Running"
            }).eq("id", scan_id).execute()

        # --- Phase 1: Crawl ---
        print(f"[*] Phase 1: Crawling {target_url}...")
        spider = Spider(
            start_url=target_url, 
            max_pages=max_pages,
            auth_mode=auth_mode,
            login_url=login_url,
            username=username,
            password=password
        )
        crawled_urls, cookies = await spider.crawl()
        
        # Use session_cookies if provided (for cookies auth mode)
        if session_cookies:
            cookies = session_cookies
            print(f"[*] Using {len(cookies)} provided session cookies")
        
        # Initialize Session with Cookies
        cookie_jar = {c['name']: c['value'] for c in cookies}
        session = aiohttp.ClientSession(cookies=cookie_jar)
        
        # Include base URL if not already crawled
        if target_url not in crawled_urls:
            crawled_urls.insert(0, target_url)
        
        crawled_count = len(crawled_urls)
        print(f"[*] Crawl Complete. Found {crawled_count} URLs.")
        
        scan_results[scan_id]["crawled_urls"] = crawled_urls
        
        if supabase:
            supabase.table("scans").update({
                "crawled_count": crawled_count
            }).eq("id", scan_id).execute()

        # --- Phase 2: Scan ---
        print(f"[*] Phase 2: Scanning {crawled_count} URLs...")
        scanner = VulnerabilityScanner(
            scan_id=scan_id, 
            supabase_client=supabase, 
            stealth_mode=stealth_mode
        )
        
        # Scan each crawled URL
        for i, url in enumerate(crawled_urls):
            if not url.startswith("http"):
                continue
            print(f"[*] Scanning ({i+1}/{crawled_count}): {url}")
            try:
                await scanner.scan_url(url, session)
            except Exception as e:
                print(f"[!] Error scanning {url}: {e}")
            
            # Update findings in real-time (in-memory)
            scan_results[scan_id]["findings"] = scanner.findings

        # --- Phase 3: Complete ---
        vulnerability_count = len(scanner.findings)
        print(f"[SUCCESS] Scan completed. Found {vulnerability_count} vulnerabilities.")

        scan_results[scan_id]["status"] = "Completed"
        scan_results[scan_id]["vulnerability_count"] = vulnerability_count
        scan_results[scan_id]["completed_at"] = datetime.utcnow().isoformat()
        
        if supabase:
            supabase.table("scans").update({
                "status": "Completed",
                "vulnerability_count": vulnerability_count,
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", scan_id).execute()

    except Exception as e:
        print(f"[ERROR] Scan Failed: {e}")
        import traceback
        traceback.print_exc()
        
        scan_results[scan_id]["status"] = "Error"
        scan_results[scan_id]["error"] = str(e)
        
        if supabase:
            supabase.table("scans").update({
                "status": "Error"
            }).eq("id", scan_id).execute()
    
    finally:
        if session:
            await session.close()

# --- API Routes ---

@app.post("/scan", response_model=ScanResponse)
async def create_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    """Start a new scan"""
    try:
        scan_id = None
        
        if supabase:
            # Insert into DB
            scan_data = {
                "target_url": request.url,
                "status": "Pending",
                "user_id": request.user_id 
            }
            res = supabase.table("scans").insert(scan_data).execute()
            scan_id = res.data[0]['id']
        else:
            # Generate UUID for in-memory
            import uuid
            scan_id = str(uuid.uuid4())
            scan_results[scan_id] = {
                "id": scan_id,
                "target_url": request.url,
                "status": "Pending",
                "user_id": request.user_id,
                "created_at": datetime.utcnow().isoformat()
            }
        
        # Start background scan
        background_tasks.add_task(
            run_scan, 
            scan_id, 
            request.url, 
            request.max_pages, 
            request.login_url, 
            request.username, 
            request.password, 
            request.auth_mode, 
            request.stealth_mode,
            request.session_cookies
        )
        
        return {"scan_id": scan_id, "status": "Pending", "target": request.url}
    
    except Exception as e:
        import traceback
        print(f"[ERROR] Create scan failed: {e}")
        traceback.print_exc()
        return {"scan_id": "", "status": "Error", "target": request.url}

@app.get("/scan/{scan_id}")
async def get_scan(scan_id: str):
    """Get scan status and results"""
    # Try in-memory first (for real-time updates)
    if scan_id in scan_results:
        data = scan_results[scan_id].copy()
        data["id"] = scan_id
        return data
    
    # Fallback to DB
    if supabase:
        try:
            res = supabase.table("scans").select("*").eq("id", scan_id).single().execute()
            data = res.data
            
            # Get vulnerabilities
            vulns_res = supabase.table("vulnerabilities").select("*").eq("scan_id", scan_id).execute()
            data['findings'] = vulns_res.data
            data['crawled_urls'] = []  # Not stored in DB
            
            return data
        except Exception as e:
            print(f"[!] Get scan error: {e}")
    
    return {"error": "Scan not found", "id": scan_id}

@app.get("/history")
async def get_history(user_id: Optional[str] = None):
    """Get scan history"""
    if supabase:
        try:
            query = supabase.table("scans").select("*").order("created_at", desc=True).limit(50)
            if user_id:
                query = query.eq("user_id", user_id)
            
            res = query.execute()
            return res.data
        except Exception as e:
            print(f"[!] History error: {e}")
            return []
    
    # Return in-memory scans
    scans = list(scan_results.values())
    if user_id:
        scans = [s for s in scans if s.get("user_id") == user_id]
    return scans

@app.get("/report/{scan_id}")
async def get_report(scan_id: str):
    """Generate and return PDF report"""
    try:
        # 1. Fetch data
        scan_data = await get_scan(scan_id)
        if not scan_data or "error" in scan_data:
            return {"error": "Scan not found"}
        
        # 2. Generate PDF
        pdf = PDFReport()
        filename = f"report_{scan_id}.pdf"
        
        # Clean old report if exists
        try:
            if os.path.exists(filename):
                os.remove(filename)
        except:
            pass
            
        try:
            pdf.generate(scan_data, filename)
        except Exception as e:
            # Fallback PDF on error
            print(f"[ERROR] PDF Generation Failed: {e}")
            import traceback
            traceback.print_exc()
            
            err_pdf = PDFReport()
            err_pdf.add_page()
            err_pdf.set_font('Arial', 'B', 16)
            err_pdf.cell(0, 10, "Report Generation Failed", 0, 1)
            err_pdf.set_font('Arial', '', 12)
            err_pdf.multi_cell(0, 10, f"An error occurred while generating the report:\n{str(e)}\n\nPlease checks server logs.")
            err_pdf.output(filename)
        
        # 3. Form readable download name
        # Safe target name
        target_raw = scan_data.get('target', scan_data.get('target_url', 'target') or 'target')
        target = str(target_raw).replace('http://', '').replace('https://', '').replace('/', '_').replace(':', '')
        date_str = datetime.now().strftime("%Y%m%d")
        readable_name = f"Scancrypt_Report_{target}_{date_str}.pdf"
        
        return FileResponse(
            filename, 
            media_type='application/pdf', 
            filename=readable_name
        )
    except Exception as e:
        print(f"[FATAL] Report endpoint failed: {e}")
        return {"error": str(e)}

@app.get("/debug/scans")
async def debug_scans():
    """Debug endpoint to see all in-memory scans"""
    return {
        "in_memory_count": len(scan_results),
        "scans": list(scan_results.keys()),
        "supabase_connected": supabase is not None
    }

@app.get("/")
def health_check():
    """Health check endpoint"""
    return {
        "status": "online", 
        "version": "2.0",
        "supabase_connected": supabase is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

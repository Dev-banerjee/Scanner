import requests
import time
import json

# Configuration
SCANNER_API = "http://localhost:8000"
TARGET_URL = "http://localhost:8081"
LOGIN_URL = "http://localhost:8081/login"
USERNAME = "admin"
PASSWORD = "password"

def run_auth_verification():
    print(f"[*] Starting Authenticated Scan Verification...")
    print(f"[*] Target: {TARGET_URL}")
    print(f"[*] Creds: {USERNAME}:{PASSWORD}")

    # 1. Start Scan
    payload = {
        "url": TARGET_URL,
        "max_pages": 10,
        "login_url": LOGIN_URL,
        "username": USERNAME,
        "password": PASSWORD,
        "auth_mode": "auto"
    }
    
    try:
        res = requests.post(f"{SCANNER_API}/scan", json=payload)
        res.raise_for_status()
        scan_id = res.json()["scan_id"]
        print(f"[*] Scan started! ID: {scan_id}")
    except Exception as e:
        print(f"[!] Failed to start scan: {e}")
        return

    # 2. Poll for Completion
    while True:
        status_res = requests.get(f"{SCANNER_API}/scan/{scan_id}")
        data = status_res.json()
        status = data["status"]
        print(f"[*] Status: {status} | Findings: {len(data['findings'])}")
        
        if status in ["Completed", "Error"]:
            break
        time.sleep(2)

    # 3. Analyze Results
    print("\n[*] Scan Completed. Analyzing Findings...")
    findings = data["findings"]
    
    # Check for Protected Content Detection
    protected_found = False
    for f in findings:
        type_val = f.get("type", f.get("name", "")).lower()
        evidence_val = f.get("evidence", "") or ""
        url_val = f.get("url", "") or ""
        
        if "sensitive_data" in type_val or "sensitive_info" in type_val or "secret" in evidence_val.lower():
            if "SECRET_DATA_ACCESS_GRANTED" in evidence_val or "/auth/secret" in url_val:
                print(f"[+] SUCCESS: Found protected content at {url_val}")
                print(f"    Evidence: {evidence_val}")
                protected_found = True

        if "bola" in type_val or "idor" in type_val:
            if "101" in evidence_val or "SSN" in evidence_val:
                 print(f"[+] SUCCESS: Found BOLA/IDOR at {url_val}")
                 print(f"    Evidence: {evidence_val}")

        if "bac" in type_val or "access control" in type_val:
            if "dashboard" in url_val.lower():
                 print(f"[+] SUCCESS: Found Broken Access Control at {url_val}")
                 print(f"    Evidence: {evidence_val}")

        if "jwt" in type_val or "alg: none" in evidence_val.lower():
             print(f"[+] SUCCESS: Found Insecure JWT at {url_val}")
             print(f"    Evidence: {evidence_val}")

        if "cookie" in type_val:
             print(f"[+] SUCCESS: Found Insecure Cookie at {url_val}")
             print(f"    Evidence: {evidence_val}")

    if protected_found:
        print("\n[SUCCESS] Authentication Logic Verified! The scanner successfully logged in and crawled protected areas.")
    else:
        print("\n[FAILED] Could not find protected content. Login might have failed.")
        print("Findings Found:")
        for f in findings:
            print(f"- {f.get('type', f.get('name', ''))} at {f.get('url')}")

if __name__ == "__main__":
    run_auth_verification()

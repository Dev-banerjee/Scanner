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
        "password": PASSWORD
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
        if "sensitive_data" in f["type"].lower() or "sensitive_info" in f["type"].lower() or "secret" in f["evidence"].lower():
            if "SECRET_DATA_ACCESS_GRANTED" in f["evidence"] or "/auth/secret" in f["url"]:
                print(f"[+] SUCCESS: Found protected content at {f['url']}")
                print(f"    Evidence: {f['evidence']}")

        if "bola" in f['type'].lower() or "idor" in f['type'].lower():
            if "101" in f['evidence'] or "SSN" in f['evidence']:
                 print(f"[+] SUCCESS: Found BOLA/IDOR at {f['url']}")
                 print(f"    Evidence: {f['evidence']}")

        if "bac" in f['type'].lower() or "access control" in f['type'].lower():
            if "dashboard" in f['url'].lower():
                 print(f"[+] SUCCESS: Found Broken Access Control at {f['url']}")
                 print(f"    Evidence: {f['evidence']}")

        if "jwt" in f['type'].lower() or "alg: none" in f['evidence'].lower():
             print(f"[+] SUCCESS: Found Insecure JWT at {f['url']}")
             print(f"    Evidence: {f['evidence']}")

        if "cookie" in f['type'].lower():
             print(f"[+] SUCCESS: Found Insecure Cookie at {f['url']}")
             print(f"    Evidence: {f['evidence']}")

    if protected_found:
        print("\n[SUCCESS] Authentication Logic Verified! The scanner successfully logged in and crawled protected areas.")
    else:
        print("\n[FAILED] Could not find protected content. Login might have failed.")
        print("Findings Found:")
        for f in findings:
            print(f"- {f['type']} at {f['url']}")

if __name__ == "__main__":
    run_auth_verification()

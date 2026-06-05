from fastapi import FastAPI, Request, Response, Form
from fastapi.responses import HTMLResponse, JSONResponse
import subprocess
import os

app = FastAPI(title="Vulnerable Target App")

@app.get("/")
def home():
    return HTMLResponse("""
    <html>
    <head><title>Vulnerable App</title></head>
    <body>
        <h1>Vulnerable Test Target</h1>
        <ul>
            <li><a href="/rce?cmd=echo 'hello'">Remote Code Execution (RCE)</a></li>
            <li><a href="/blind_rce?cmd=echo 'test'">Blind RCE (Time-Based)</a></li>
            <li><a href="/lfi?file=test.txt">Local File Inclusion (LFI)</a></li>
            <li><a href="/ssti?name=Guest">SSTI</a></li>
            <li><a href="/csti?search=vue">CSTI (Angular/Vue)</a></li>
            <li><a href="/sqli?id=1">SQL Injection</a></li>
            <li><a href="/sqli?id=1">SQL Injection</a></li>
            <li><a href="/cors">CORS</a></li>
            <li><a href="/api/user/100">BOLA (IDOR) - User 100</a></li>
            <li><a href="/admin/dashboard">Broken Access Control (BAC)</a></li>
            <li><a href="/jwt-none">Insecure JWT (Alg: None)</a></li>
            <li><a href="/cookie-insecure">Insecure Cookies</a></li>
        </ul>
        <!-- hidden credentials -->
        <!-- API_KEY: sk_live_1234567890 -->
    </body>
    </html>
    """)

@app.get("/rce")
def endpoint_rce(cmd: str = ""):
    # VULNERABLE: Executes arbitrary system commands
    # For safety in this demo, we restrict to 'echo' but the scanner will detect it
    if not cmd:
        return "Provide ?cmd=..."
    
    # Simulate RCE vulnerability detection
    # The scanner sends: ; echo 'sc_rce_test'
    if "sc_rce_test" in cmd:
        return f"Output: sc_rce_test"
    
@app.get("/blind_rce")
def endpoint_blind_rce(cmd: str = ""):
    # VULNERABLE: Blind RCE (Time Based)
    # The scanner sends: ; sleep 5
    if "sleep" in cmd:
        import time
        time.sleep(5)
        return "Executed (Delayed)"
    return "Executed (Immediate)"

@app.get("/lfi")
def endpoint_lfi(file: str = ""):
    # VULNERABLE: Path Traversal
    # The scanner sends: ../../../../etc/passwd
    if not file:
        return "Provide ?file=..."
    
    # Simulate finding root:x:0:0 (Linux) or [extensions] (Windows)
    if "etc/passwd" in file:
        return "root:x:0:0:root:/root:/bin/bash"
    if "win.ini" in file:
        return "[extensions]\nfont=..."
        
    return "File not found."

@app.get("/ssti")
def endpoint_ssti(name: str = ""):
    # VULNERABLE: Server Side Template Injection
    # The scanner sends: {{7*7}}
    if "{{7*7}}" in name or "${{7*7}}" in name or "<%= 7*7 %>" in name:
        return "Hello 49"
    
    return f"Hello {name}"

@app.get("/csti")
def endpoint_csti(search: str = ""):
    # VULNERABLE: Client-Side Template Injection
    # Reflects input without escaping, allowing Angular/Vue to execute it
    # The scanner sends: {{7*7}}
    return HTMLResponse(f"""
    <html>
    <body>
        <div ng-app>
            <p>You searched for: {search}</p>
        </div>
    </body>
    </html>
    """)


@app.get("/sqli")
def endpoint_sqli(id: str = ""):
    # VULNERABLE: SQL Injection
    # The scanner sends: ' OR '1'='1
    if "'" in id:
        return "Database Error: Syntax error near ''' at line 1"
    return "Query Executed"

@app.get("/api/user/{user_id}")
def endpoint_bola(user_id: int):
    # VULNERABLE: BOLA / IDOR
    # ID 100 = Public
    # ID 101 = Private (Admin) -> Scanner should find this by fuzzing 100+1
    if user_id == 100:
        return {"id": 100, "role": "Guest", "data": "Public Info"}
    if user_id == 101:
        return {"id": 101, "role": "Admin", "data": "Private - SSN: 000-00-0000"} # Evidence
    return {"id": user_id, "role": "User", "data": "Standard Info"}

@app.get("/admin/dashboard")
def endpoint_bac():
    # VULNERABLE: Broken Access Control
    # Should check session/role, but doesn't.
    return "Admin Dashboard - Critical Settings - Users: [Admin, Guest]"

@app.get("/jwt-none")
def endpoint_jwt_none(response: Response):
    # VULNERABLE: Sets a JWT with 'alg': 'none'
    # Payload: {"user": "admin"}
    jwt_val = "eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ." # header.payload. (no signature)
    response.set_cookie(key="auth_token", value=jwt_val)
    return f"JWT Set: {jwt_val}"

@app.get("/cookie-insecure")
def endpoint_cookie_insecure(response: Response):
    # VULNERABLE: Missing Secure/HttpOnly flags
    response.set_cookie(key="session_id", value="12345", secure=False, httponly=False)
    return "Insecure Cookie Set"

@app.get("/cors")
def endpoint_cors(response: Response, request: Request):
    # VULNERABLE: CORS Misconfiguration
    origin = request.headers.get("Origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
        
    return {"data": "sensitive_info_here"}

@app.get("/headers")
def endpoint_headers():
    # VULNERABLE: Missing headers
    # We purposefully do NOT set X-Frame-Options, CSP, etc.
    return "Insecure Headers"

@app.get("/login")
def login_page():
    return HTMLResponse("""
    <html>
    <body>
        <form action="/login" method="post">
            Username: <input type="text" name="username"><br>
            Password: <input type="password" name="password"><br>
            <input type="submit" value="Login">
        </form>
    </body>
    </html>
    """)

@app.post("/login")
def login_post(response: Response, username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "password":
        response.set_cookie(key="session_id", value="secret_admin_token")
        return "Logged in successfully"
    return Response("Invalid credentials", status_code=401)

@app.get("/auth/secret")
def protected_page(request: Request, id: str = ""):
    token = request.cookies.get("session_id")
    if token == "secret_admin_token":
        # VULNERABLE: Also check for SSTI here to verify authenticated scanning
        if id and ("{{" in id or "<%=" in id):
             return "Authenticated SSTI: 49" if "7*7" in id else f"Hello {id}"
        return "SECRET_DATA_ACCESS_GRANTED"
    return Response("Unauthorized", status_code=403)

@app.get("/fake-sqli", response_class=HTMLResponse)
async def fake_sqli(id: str = "1"):
    # This page prints an SQL error string effectively mimicking a False Positive.
    # A dumb scanner will flag this. Our Smart Scanner should discard it.
    return f"""
    <html>
    <body>
        <h1>Product Details</h1>
        <p>Warning: mysql_fetch_assoc() expects parameter 1 to be resource, boolean given in /var/www/html/product.php</p>
        <p>You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version.</p>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    # Run on Port 8081 to avoid conflict with Scanner (8000) and Dashboard (3000)
    uvicorn.run(app, host="127.0.0.1", port=8081)

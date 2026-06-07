# Scancrypt Startup Script for Windows
# Run this in PowerShell from the root directory

echo "[*] Starting Scancrypt System..."

# 1. Start Backend
echo "[*] Launching Backend on http://localhost:8000..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd scanner-engine; python main.py"

# 2. Start Dashboard
echo "[*] Launching Dashboard on http://localhost:3000..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd dashboard; npm run dev"

# 3. Start Vulnerable App
echo "[*] Launching Vulnerable App on http://localhost:8081..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python vulnerable_app.py"

echo "[DONE] All components launched in separate windows!"
echo "[INFO] Wait a few seconds, then visit http://localhost:3000"

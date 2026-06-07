Stop-Process -Name python -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Starting Vulnerable App..."
Start-Process python -ArgumentList "vulnerable_app.py" -WorkingDirectory "d:\Scancrypt"
Write-Host "Starting Scanner Engine..."
Start-Process python -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "d:\Scancrypt\scanner-engine"
Write-Host "Services Restarted! You close this window now."
Start-Sleep -Seconds 5

---
description: Start the entire Scancrypt system (Backend, Dashboard, and Vulnerable App)
---

To start everything, you should run these commands in separate terminal sessions:

1. **Start the Scanner Backend**:
// turbo
```powershell
cd scanner-engine; python main.py
```

2. **Start the Dashboard**:
// turbo
```powershell
cd dashboard; npm run dev
```

3. **Start the Vulnerable App (Target)**:
// turbo
```powershell
python vulnerable_app.py
```

Once all three are running:
- Open http://localhost:3000 in the browser.
- Use http://localhost:8081 as the target.

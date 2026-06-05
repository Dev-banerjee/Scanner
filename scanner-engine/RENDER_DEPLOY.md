# Render.com Deployment Configuration

## Build Settings (in Render Dashboard)
- **Build Command**: `cd scanner-engine && chmod +x build.sh && ./build.sh`
- **Start Command**: `cd scanner-engine && chmod +x start.sh && ./start.sh`

## Environment Variables
Set these in Render Dashboard → Environment:
- `SUPABASE_URL`: `https://hkjtntapeumanmhpydqb.supabase.co`
- `SUPABASE_KEY`: (your anon key ending in ...JDhI)
- `PYTHON_VERSION`: `3.11` (optional, Render auto-detects)

## Instance Type
- **Free** tier works perfectly with Playwright!
- Render has 512MB RAM vs Railway's 512MB (but better CPU allocation)

## After Deployment
Your backend URL will be: `https://scancrypt-backend.onrender.com`

Use this URL in Vercel's `NEXT_PUBLIC_API_URL` environment variable.

## Full Playwright Support ✅
- Dynamic crawling of JavaScript-heavy SPAs (React/Vue/Angular)
- Smart 404 detection
- Stealth mode with jitter
- Interactive login support

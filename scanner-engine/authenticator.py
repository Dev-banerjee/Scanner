import aiohttp
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from playwright.async_api import async_playwright

class Authenticator:
    def __init__(self):
        pass

    async def login(self, login_url: str, username: str, password: str) -> aiohttp.ClientSession:
        """
        Attempts to log in to the application and returns an authenticated aiohttp session.
        """
        print(f"[*] Attempting login at {login_url} as {username}")
        
        # Create a session that will hold the cookies
        session = aiohttp.ClientSession()
        
        try:
            # 1. GET the login page to get CSRF tokens and cookies
            async with session.get(login_url) as resp:
                text = await resp.text()
                soup = BeautifulSoup(text, 'html.parser')

                # 2. Find the login form
                # Heuristic: Find first form with a password field
                password_input = soup.find('input', {'type': 'password'})
                if not password_input:
                    print("[!] No password field found on login page.")
                    return session

                form = password_input.find_parent('form')
                if not form:
                    print("[!] Password field is not inside a form.")
                    return session

                # 3. Extract Form Destination (Action)
                action = form.get('action')
                post_url = urljoin(login_url, action) if action else login_url

                # 4. Extract All Inputs (including hidden CSRF tokens)
                data = {}
                for input_tag in form.find_all('input'):
                    name = input_tag.get('name')
                    value = input_tag.get('value', '')
                    if not name: continue
                    
                    if input_tag.get('type') == 'password':
                        data[name] = password
                    elif name.lower() in ['user', 'username', 'email', 'login']:
                        data[name] = username
                    else:
                        # Keep existing values (e.g. CSRF token)
                        data[name] = value
                
                print(f"[*] Found login form. Posting to {post_url} with data keys: {list(data.keys())}")

            # 5. POST the credentials
            async with session.post(post_url, data=data) as post_resp:
                print(f"[*] Login POST status: {post_resp.status}")
                # We assume success if we get a redirect (3xx) or a 200 OK.
                # Ideally, we should check for "logout" in the response, but for now we rely on cookies being set.
                if post_resp.cookies:
                    print(f"[*] Session cookies captured: {len(post_resp.cookies)}")
                else:
                    print("[!] Warning: No cookies received after login.")
                    
        except Exception as e:
            print(f"[!] Login failed: {e}")
            # Don't close session here, we might want to return it even if failed (partial state)
            # But usually we should handle it.
        
        return session

    async def interactive_login(self, login_url: str) -> aiohttp.ClientSession:
        """
        Launches a visible browser for the user to log in manually.
        Waits for the user to complete login (detects URL change or cookie set).
        Returns an aiohttp session with the stolen cookies.
        """
        print(f"[*] Starting Interactive Login at {login_url}")
        print("[!] Please log in explicitly in the browser window!")
        
        session = aiohttp.ClientSession()
        
        async with async_playwright() as p:
            # Launch headful browser
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context()
            page = await context.new_page()
            
            try:
                # Inject a global button on ever page load
                await context.add_init_script("""
                    window.addEventListener('DOMContentLoaded', () => {
                        const btn = document.createElement('button');
                        btn.innerHTML = "✅ I'm Logged In (Click to Continue)";
                        btn.style.position = "fixed";
                        btn.style.bottom = "20px";
                        btn.style.right = "20px";
                        btn.style.zIndex = "99999";
                        btn.style.padding = "15px 30px";
                        btn.style.backgroundColor = "#00f0ff";
                        btn.style.color = "#000";
                        btn.style.border = "2px solid #000";
                        btn.style.borderRadius = "8px";
                        btn.style.fontWeight = "bold";
                        btn.style.cursor = "pointer";
                        btn.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
                        
                        btn.onclick = () => {
                            btn.innerHTML = "⏳ Capturing Session...";
                            btn.style.backgroundColor = "#00ff00";
                            // Set a specialized flag
                            window._scancrypt_logged_in = true;
                        };
                        
                        document.body.appendChild(btn);
                    });
                """)

                await page.goto(login_url)
                
                print("[*] Waiting for user to click 'I'm Logged In' button...")
                
                logged_in = False
                # Loop for 120 seconds (2 mins)
                for _ in range(240): 
                    await asyncio.sleep(0.5)
                    
                    # Check JS flag
                    is_clicked = await page.evaluate("() => window._scancrypt_logged_in === true")
                    
                    if is_clicked:
                        print("[*] User clicked 'I'm Logged In'.")
                        logged_in = True
                        break
                    
                    # Fallback: Check Cookie (just in case)
                    if not logged_in:
                         cookies = await context.cookies()
                         if any(c['name'] == 'session_id' for c in cookies):
                             # Only print, don't auto-close to avoid confusion, let user click button
                             # print("[*] Session cookie detected (Waiting for button click confirmation)...")
                             pass

                if not logged_in:
                    print("[!] Timeout waiting for user confirmation.")
                else:
                    # Allow 1s for any final redirects/cookies to settle
                    await asyncio.sleep(1.0)
                
                # Steal cookies
                cookies = await context.cookies()
                print(f"[*] Captured {len(cookies)} cookies from browser.")
                
                for cookie in cookies:
                    session.cookie_jar.update_cookies({cookie['name']: cookie['value']})
                    
            except Exception as e:
                print(f"[!] Interactive Login Error: {e}")
            finally:
                await browser.close()
                
        return session

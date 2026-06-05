import os
from supabase import create_client, Client

url = "https://sxnmmsawsuwlluzkgjzb.supabase.co"
key = "sb_publishable_2AY-sMjdPIAvBjt55_WOCQ_um4cvfV0"

print(f"Testing dashboard credentials...")
try:
    supabase = create_client(url, key)
    res = supabase.table("scans").select("*").limit(1).execute()
    print("scans table:", res)
    try:
        res = supabase.table("vulnerabilities").select("*").limit(1).execute()
        print("vulnerabilities table:", res)
    except Exception as e:
        print("vulnerabilities error:", e)
    
    try:
        res = supabase.table("findings").select("*").limit(1).execute()
        print("findings table:", res)
    except Exception as e:
        print("findings error:", e)
        
except Exception as e:
    print("Dashboard credentials failed:", e)

print("-" * 40)
url2 = "https://hkjtntapeumanmhpydqb.supabase.co"
key2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhranRudGFwZXVtYW5taHB5ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODg5MzEsImV4cCI6MjA4NDE2NDkzMX0.Ssmante-lCIY90CkYjeg2LLMH0v-6nuse3CV_9cJDhI"

print(f"Testing engine example credentials...")
try:
    supabase2 = create_client(url2, key2)
    res = supabase2.table("scans").select("*").limit(1).execute()
    print("scans table:", res)
    
    try:
        res = supabase2.table("vulnerabilities").select("*").limit(1).execute()
        print("vulnerabilities table:", res)
    except Exception as e:
        print("vulnerabilities error:", e)
        
    try:
        res = supabase2.table("findings").select("*").limit(1).execute()
        print("findings table:", res)
    except Exception as e:
        print("findings error:", e)

except Exception as e:
    print("Engine example credentials failed:", e)

import asyncio
from spider import Spider
from scanner import VulnerabilityScanner

async def test_engine():
    print("1. Running Spider...")
    spider = Spider("http://testphp.vulnweb.com/", max_pages=10)
    urls = await spider.crawl()
    print(f"Spider found {len(urls)} URLs.")
    
    print("\n2. Running Scanner...")
    scanner = VulnerabilityScanner()
    for url in urls:
        await scanner.scan_url(url)
        
    print(f"\nScanner found {len(scanner.findings)} issues.")
    for f in scanner.findings:
        print(f" - [{f['severity']}] {f['type']} at {f['url']}")

if __name__ == "__main__":
    asyncio.run(test_engine())

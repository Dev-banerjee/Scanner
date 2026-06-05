import asyncio
from spider import Spider

async def test():
    spider = Spider("http://testphp.vulnweb.com/", max_pages=10)
    urls = await spider.crawl()
    print(f"Total: {len(urls)}")
    for u in urls:
        print(u)

if __name__ == "__main__":
    asyncio.run(test())

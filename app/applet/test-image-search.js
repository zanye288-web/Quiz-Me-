async function testDuckDuckGo() {
  const query = "mitochondria cristae diagram";
  // DuckDuckGo image search token flow:
  // 1. GET https://duckduckgo.com/?q=...
  // 2. extract vqd
  // 3. GET https://duckduckgo.com/i.js?q=...&vqd=...
  try {
    const res1 = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      }
    });
    console.log("DDG step 1 status:", res1.status);
    const html = await res1.text();
    const vqdMatch = html.match(/vqd=['"]?([0-9-]+)['"]?/i) || html.match(/vqd=([0-9-]+)&/i);
    console.log("VQD match:", vqdMatch ? vqdMatch[1] : null);
    if (vqdMatch) {
      const vqd = vqdMatch[1];
      const res2 = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://duckduckgo.com/',
        }
      });
      console.log("DDG step 2 status:", res2.status);
      const data = await res2.json();
      console.log("DDG results count:", data?.results?.length);
      if (data?.results?.length) {
        console.log("Sample 1:", data.results[0].title, data.results[0].image);
      }
    }
  } catch (e) {
    console.error("DDG err:", e);
  }
}
testDuckDuckGo();

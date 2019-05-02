browser.webRequest.onBeforeRequest.addListener(request => {
  const url = new URL(request.url);
  return browser.storage.sync.get('instance').then((res) => {
    var instance = res.instance || 'invidio.us';
    return new Promise((resolve, _) =>{
      if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
        console.log('youtube detected in url ' + url)
        const v = url.searchParams.get("v");
        if (v) {
          resolve({redirectUrl: `https://` + instance + `/watch?v=${v}`});
        }
        const q = url.searchParams.get("q") || url.searchParams.get("search_query");
        if (q) {
          resolve({redirectUrl: `https://` + instance + `/search?q=${q}`});
        }
        if (url.pathname.startsWith("/channel/")) {
          resolve({redirectUrl: `https://` + instance + `${url.pathname}`});
        }
      } else if (url.hostname.endsWith("youtu.be")) {
        resolve({redirectUrl: `https://` + instance + `/watch?v=${url.pathname.replace("/", "")}`});
      }
    })
  }).then(blockingResponse => {
    console.log('returning outer response')
    console.dir(blockingResponse)
    return blockingResponse
  });
}, {
  "urls": ["*://*.youtube.com/*", "*://*.youtube-nocookie.com/*", "*://*.youtu.be/*"],
  "types": ["main_frame"]
},
  ["blocking"]
);

function createBlockingRequest(url, domain) {
  if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
    console.log('youtube detected in url ' + url)
    const v = url.searchParams.get("v");
    const q = url.searchParams.get("q") || url.searchParams.get("search_query");
    if (v) {
      return {redirectUrl: `https://` + domain + `/watch?v=${v}`}
    } else if (q) {
      return {redirectUrl: `https://` + domain + `/search?q=${q}`}
    } else if (url.pathname.startsWith("/channel/")) {
      return {redirectUrl: `https://` + domain + `${url.pathname}`}
    } else if (url.pathname.startsWith("/embed/")) {
      return {redirectUrl: `https://` + domain + `${url.pathname}`}
    }
  } else if (url.hostname.endsWith("youtu.be")) {
    return {redirectUrl: `https://` + domain + `/watch?v=${url.pathname.replace("/", "")}`}
  }
}

browser.webRequest.onBeforeRequest.addListener(request => {
  const url = new URL(request.url);
  return browser.storage.sync.get('instance').then((res) => {
    var instance = res.instance || 'invidio.us';
    return createBlockingRequest(url, instance)
  });
},
  {
  "urls": ["<all_urls>"],
  "types": [
    "main_frame",
    "sub_frame"
  ]
},
  ["blocking"]
);



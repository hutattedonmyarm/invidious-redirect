function createBlockingRequest(url, domain, embed_domain) {
  if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
    console.log('youtube detected in url ' + url)
    const v = url.searchParams.get("v");
    const q = url.searchParams.get("q") || url.searchParams.get("search_query");
    if (v) {
      return {redirectUrl: domain + `/watch?v=${v}`}
    } else if (q) {
      return {redirectUrl: domain + `/search?q=${q}`}
    } else if (url.pathname.startsWith("/channel/")) {
      return {redirectUrl: domain + `${url.pathname}`}
    } else if (url.pathname.startsWith("/embed/")) {
      return {redirectUrl: embed_domain + `${url.pathname}`}
    }
  } else if (url.hostname.endsWith("youtu.be")) {
    return {redirectUrl: domain + `/watch?v=${url.pathname.replace("/", "")}`}
  }
}

browser.webRequest.onBeforeRequest.addListener(request => {
  const url = new URL(request.url);
  return browser.storage.sync.get('instance').then((res) => {
    var instance = res.instance || 'https://invidio.us';
    return browser.storage.sync.get('embed_instance').then((res) => {
      var embed_instance = res.embed_instance || 'https://invidio.us';
      return createBlockingRequest(url, instance, embed_instance)
    })
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



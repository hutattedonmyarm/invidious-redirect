function createBlockingRequest(url, domain, embed_domain) {
  if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
    if (url.pathname.search("^/(watch|playlist|search|channel)") > -1) {
      return {redirectUrl: domain + `${url.pathname}` + `${url.search}`}
    } else if (url.pathname.startsWith("/embed/")) {
      return {redirectUrl: embed_domain + `${url.pathname}` + `${url.search}`}
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



function createBlockingRequest(url, domain, embed_domain, originUrl) {
  const domainHost = new URL(domain).hostname;
  const embedDomainHost = new URL(embed_domain).hostname;
  console.log(originUrl.hostname, domainHost, embedDomainHost);
  if (originUrl.hostname.endsWith(domainHost) || originUrl.hostname.endsWith(embedDomainHost)) {
    return;
  } else {
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
}

browser.webRequest.onBeforeRequest.addListener(request => {
  const url = new URL(request.url);
  const originUrl = new URL(request.originUrl);
  return browser.storage.sync.get('instance').then((res) => {
    var instance = res.instance || 'https://invidio.us';
    return browser.storage.sync.get('embed_instance').then((res) => {
      var embed_instance = res.embed_instance || 'https://invidio.us';
      return createBlockingRequest(url, instance, embed_instance, originUrl)
    });
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



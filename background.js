async function checkAutoDisable(auto_disable, instance, embed_instance, origin) {
  if (!auto_disable) {
    return false;
  }
  // Automatically disable the redirect if it origantes from the chosen instance
  // To work around the "watch on youtube" button
  const cr = await isContainerRedirect(origin, instance, embed_instance);
  if (cr) {
    // Don't redirect to the instance
    return true;
  }
  // Set the origin url to check if the request
  // originally came from the instance
  let origin_url = null;
  if (origin) {
    origin_url = new URL(origin);
  }
  const domainHost = new URL(instance).hostname;
  const embedDomainHost = new URL(embed_instance).hostname;
  return origin_url && (origin_url.hostname.endsWith(domainHost) || origin_url.hostname.endsWith(embedDomainHost));
}

function createBlockingRequest(url, domain, embed_domain, origin, auto_disable) {
  return checkAutoDisable(auto_disable, domain, embed_domain, origin).then(res => {
    if (res) {
      return;
    }
    if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      if (url.pathname.search("^/(watch|playlist|search|channel)") > -1) {
        return {redirectUrl: domain + `${url.pathname}` + `${url.search}`}
      } else if (url.pathname.startsWith("/embed/")) {     
        return {redirectUrl: embed_domain + `${url.pathname}` + `${url.search}`}
      }
    } else if (url.hostname.endsWith("youtu.be")) {
      return {redirectUrl: domain + `/watch?v=${url.pathname.replace("/", "")}`}
    }
  });
}

async function isContainerRedirect(origin_url, domain, embed_domain) {
  // Tab created by an extension?
  if (origin_url && !origin_url.startsWith("moz-extension://")) {
    return false;
  }
  const tabs = await browser.tabs.query({active: true, currentWindow:true});
  if (tabs.length == 0) {
    return false;
  }
  // Active tab in the current window - there can be only one
  const tab = tabs[0];
  // Tab opened by another tab?
  if (tab.openerTabId === undefined) {
    return false;
  }
  try {
    // On the freshly opened tab the url is not yet set,
    // but the title is set to the url
    const new_url = (tab.url === "about:blank" ? new URL("https://" + tab.title) : new URL(tab.url));
    // New tab should be a youtube tab 
    if (new_url.hostname !== "youtube.com") {
      return;
    }

    const opener_tab = await browser.tabs.get(tab.openerTabId);
    const domain_url = new URL(domain);
    const embed_domain_url = new URL(embed_domain);
    const opener_url = new URL(opener_tab.url);
    // The url of the tab this came from should be from our invidious instance 
    if (opener_url.hostname !== opener_url.hostname && opener_host.hostname !== embed_domain_url.hostname) {
      return false;
    }

    // It should also point to the same thing (video, playlist, user, etc) as the newly created youtube tab
    if (new_url.href.replace(new_url.hostname, domain_url.hostname) !== opener_url.href && new_url.href.replace(new_url.hostname, embed_domain_url.hostname) !== opener_url.href) {
      return false;
    }

    // And finally it needs to be in a different container than the new one
    return opener_tab.cookieStoreId !== tab.cookieStoreId;
  } catch (error) {
    console.error("Error fetching the opener tab: ", error);
    return false;
  }
}

browser.webRequest.onBeforeRequest.addListener(request => {
  const url = new URL(request.url);

  return browser.storage.sync.get(null).then((res) => {
    const auto_disable = res.automatic_disable;
    const instance = res.instance || 'https://invidio.us';
    const embed_instance = res.embed_instance || 'https://invidio.us';
    return createBlockingRequest(url, instance, embed_instance, request.originUrl, auto_disable);
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

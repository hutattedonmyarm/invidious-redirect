const options_selectors = ['instance', 'embed_instance']

function saveOptions(e) {
  options_selectors.forEach(sel => {
    var inst = document.querySelector("#" + sel).value;
    var real_instance;
    try {
      real_instance = new URL(inst).origin;
    } catch (e) {
      try {
        real_instance = new URL('https://' + inst).origin;
      } catch (e) {
        real_instance = 'https://invidio.us'
      }
    }
    browser.storage.sync.set({
      [sel]: real_instance
    });
    e.preventDefault();
  })
}

function restoreOptions() {
  options_selectors.forEach(sel => {
    var gettingItem = browser.storage.sync.get(sel);
    gettingItem.then((res) => {
      document.querySelector("#" + sel).value = res[sel] || 'https://invidio.us';
    });
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

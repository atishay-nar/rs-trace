const ICON_ACTIVE = {
  16: "icons/icon16-active.png",
  48: "icons/icon48-active.png",
  128: "icons/icon128-active.png",
};

const ICON_DEFAULT = {
  16: "icons/icon16.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png",
};

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  if (msg.type === "PAPER_DETECTED") {
    chrome.action.setIcon({ path: ICON_ACTIVE, tabId });
  } else if (msg.type === "NO_PAPER") {
    chrome.action.setIcon({ path: ICON_DEFAULT, tabId });
  }
});

// Reset to gray when navigating away
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    chrome.action.setIcon({ path: ICON_DEFAULT, tabId });
  }
});

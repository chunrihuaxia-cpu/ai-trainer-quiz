// Screen Buddy Background Service Worker
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ pet: 'cat', stats: { steps: 0, petted: 0, awakeMinutes: 0 } });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === 'getStats') {
    chrome.storage.local.get(['stats','pet'], function(data) {
      sendResponse(data);
    });
    return true; // async
  }
});

// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'open_new_tab' && message.url) {
        chrome.tabs.create({ url: message.url });
    }
});

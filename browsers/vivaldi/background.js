"use strict";

const startPageUrl = chrome.runtime.getURL("index.html");
const pendingWindows = new Set();

function isBuiltInStartPage(url) {
  if (!url) return false;

  return [
    "chrome://newtab",
    "vivaldi://newtab",
    "vivaldi://startpage",
    "chrome://vivaldi-webui/startpage"
  ].some((prefix) => url.startsWith(prefix));
}

async function redirectBuiltInStartPage(windowId) {
  if (!pendingWindows.has(windowId)) return;

  try {
    const tabs = await chrome.tabs.query({ windowId });
    if (tabs.length !== 1) {
      pendingWindows.delete(windowId);
      return;
    }

    const tab = tabs[0];
    const url = tab.pendingUrl || tab.url;

    if (!url || url === "about:blank") return;

    pendingWindows.delete(windowId);
    if (url !== startPageUrl && isBuiltInStartPage(url)) {
      await chrome.tabs.update(tab.id, { url: startPageUrl });
    }
  } catch {
    pendingWindows.delete(windowId);
  }
}

chrome.windows.onCreated.addListener((window) => {
  if (window.type !== "normal") return;

  pendingWindows.add(window.id);
  void redirectBuiltInStartPage(window.id);
});

chrome.tabs.onCreated.addListener((tab) => {
  void redirectBuiltInStartPage(tab.windowId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    void redirectBuiltInStartPage(tab.windowId);
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  pendingWindows.delete(windowId);
});

// VerifyDeal - Chrome Extension Background Service Worker

const API_BASE = "http://localhost:3000";

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "photoverify-check",
    title: "Verify this image with VerifyDeal",
    contexts: ["image"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "photoverify-check" && info.srcUrl) {
    try {
      // Fetch the image
      const response = await fetch(info.srcUrl);
      const blob = await response.blob();

      // Send to our API
      const formData = new FormData();
      formData.append("image", blob, "verify.jpg");

      const apiResponse = await fetch(`${API_BASE}/api/verify`, {
        method: "POST",
        body: formData,
      });

      const result = await apiResponse.json();

      // Send result to popup or show notification
      chrome.storage.local.set({
        lastResult: result,
        lastImageUrl: info.srcUrl,
        lastCheckedAt: new Date().toISOString(),
      });

      // Show the popup with results
      if (tab && tab.id) {
        chrome.action.openPopup();
      }
    } catch (error) {
      console.error("VerifyDeal error:", error);
      chrome.storage.local.set({
        lastResult: { error: "Failed to verify image. Is the VerifyDeal server running?" },
        lastImageUrl: info.srcUrl,
        lastCheckedAt: new Date().toISOString(),
      });
    }
  }
});

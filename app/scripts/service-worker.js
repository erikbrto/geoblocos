(async () => {
  const OSM_ROOT_URL = 'https://www.openstreetmap.org';
  const LANDING_PAGE = '../templates/not-logged.html';
  const PANEL_PAGE = '../templates/sidepanel.html';
  let username;
  let isLogged;

  async function updateLoginInfo(tabId) {
    const { type, data } = await chrome.tabs.sendMessage(tabId, {
      type: 'GET-LOGIN',
    });

    if (type === 'LOGIN-INFO' && data.username !== username) {
      username = data.username;
      isLogged = data.isLogged;
    }
  }

  async function activateSidePanel(tabId) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: isLogged ? PANEL_PAGE : LANDING_PAGE,
      enabled: true,
    });
  }

  async function deactivateSidePanel(tabId) {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  }

  async function getCurrentTabId() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);

    return tab.id;
  }

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  await chrome.sidePanel.setOptions({ enabled: false });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.url || changeInfo.status !== 'complete') return;
    const url = new URL(tab.url);
    const isOSM = url.origin === OSM_ROOT_URL;
    const sidePanel = await chrome.sidePanel.getOptions({ tabId });

    console.log(changeInfo);

    if (!isOSM && sidePanel.enabled) {
      await deactivateSidePanel(tabId);
    } else if (isOSM && !sidePanel.enabled) {
      await updateLoginInfo(tabId);
      await activateSidePanel(tabId);
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { type, data } = request;

    switch (type) {
      case 'GET-USERNAME': {
        getCurrentTabId().then(updateLoginInfo);
        sendResponse({
          type: 'SET-USERNAME',
          data: { username: username },
        });
        break;
      }

      default:
        console.log(`invalid message: ${request}`);
    }
  });
})();

export function showLoadingSpinner() {
  const contentBox = document.getElementById('content-box');
  const divLoadingSpinner = document.createElement('div');
  const loadingSpinner = document.createElement('img');

  divLoadingSpinner.id = 'loading-spinner';
  divLoadingSpinner.className = 'loading-spinner';
  loadingSpinner.src = '../../buttons/loading-128.png';
  
  clearContentBox();
  divLoadingSpinner.appendChild(loadingSpinner);
  contentBox.appendChild(divLoadingSpinner);
}

export function removeLoadingSpinner() {
  const loadingSpinner = document.getElementById('loading-spinner');
  loadingSpinner?.remove();
}

export function clearContentBox() {
  removeContentCards();
  removeAllProjectsElements();
}

export function removeAllProjectsElements() {
  removeOpenProjectsElements();
  removeMyProjectsElements();
}

export function removeOpenProjectsElements() {
  const searchBar = document.getElementById('open-projects-search-bar');
  searchBar?.remove();
}

export function removeMyProjectsElements() {
  const searchBar = document.getElementById('my-projects-search-bar');
  const createProjectElement = document.getElementById('create-project');
  searchBar?.remove();
  createProjectElement?.remove();
}

export function removeContentCards() {
  const cards = document.getElementsByClassName('content-card');

  for (let i = cards.length - 1; i >= 0; i--) {
    cards[i].remove();
  }
}

export function viewLinkOnAtiveTab(event) {
  if (event.ctrlKey) return false;

  event.stopPropagation();
  chrome.tabs.update({
    url: event.target.href,
  });
}

export function changeSidePanelPage(pathToPage) {
  const queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions).then((tabs) => {
    chrome.sidePanel.setOptions({
      tabId: tabs[0].id,
      path: pathToPage,
      enabled: true,
    });
  });
}

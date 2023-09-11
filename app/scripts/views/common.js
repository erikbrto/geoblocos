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

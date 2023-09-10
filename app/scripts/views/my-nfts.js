function openNftPage(event) {
  event.stopPropagation();
  chrome.tabs.create({
    url: event.target.parentNode.href,
    active: true,
  });
}

function viewChangesetPage(event) {
  if (event.ctrlKey) return false;

  event.stopPropagation();
  chrome.tabs.update({
    url: event.target.href,
  });
}

function addButtonElement(parentNode) {
  const buttonElement = document.createElement('div');
  const buttonLink = document.createElement('a');
  const buttonIcon = document.createElement('img');

  buttonElement.className = 'changeset-button';
  buttonLink.href = 'https://goerli.etherscan.io/';
  buttonIcon.src = '../../buttons/view-nft-32.png';
  buttonIcon.title = 'Clique para ver os detalhes do NFT.';
  buttonIcon.className = 'img-button';

  buttonIcon.addEventListener('click', openNftPage);
  buttonLink.appendChild(buttonIcon);
  buttonElement.appendChild(buttonLink);
  parentNode.appendChild(buttonElement);
}

function addChangesetTitle(changesetId, parentNode) {
  const changesetTitleElement = document.createElement('a');

  // Alterações no campo de título do changeset
  changesetTitleElement.textContent = changesetId;
  changesetTitleElement.className = 'changeset-title';
  changesetTitleElement.href = `https://www.openstreetmap.org/changeset/${changesetId}`;
  changesetTitleElement.title =
    'Pressione [CTRL + Clique] para abrir em uma nova aba.';

  changesetTitleElement.addEventListener('click', viewChangesetPage);
  parentNode.appendChild(changesetTitleElement);
}

function addChangesetElement(changeset, parentNode) {
  const newChansetElement = document.createElement('div');

  addChangesetTitle(changeset.id, newChansetElement);
  addButtonElement(newChansetElement);

  // Alterações no elemento do changeset
  newChansetElement.id = `changeset-${changeset.id}`;
  newChansetElement.className = 'content-card changeset';
  newChansetElement.setAttribute('changesetId', changeset.id);

  parentNode.appendChild(newChansetElement);
}

function removeContentCards(contentBox) {
  const cards = contentBox.getElementsByClassName('content-card');

  for (let i = cards.length - 1; i >= 0; i--) {
    cards[i].remove();
  }
}

export function showMintedChangesets(changesets) {
  const contentBox = document.getElementById('content-box');

  removeContentCards(contentBox);

  if (changesets.getAllMinted().length > 0) {
    for (const changeset of changesets.getAllMinted()) {
      addChangesetElement(changeset, contentBox);
    }
  }
}

async function mintNFT(event) {
  event.stopPropagation();
  event.target.src = '../../buttons/loading.gif';
  event.target.style = 'transform: scale(1)';
  const changesetId =
    event.target.parentNode.parentNode.parentNode.getAttribute('changesetid');

  if (await ethutils.mintChangeset(changesetId)) {
    event.target.src = '../../buttons/view-nft-32.png';
  } else {
    event.target.src = '../../buttons/mint-nft-32.png';
  }
  event.target.style = null;
}

function viewChangesetPage(event) {
  if (event.ctrlKey) return false;

  event.stopPropagation();
  chrome.tabs.update({
    url: event.target.href,
  });
}

function addButtonElement(changesetStatus, parentNode) {
  const buttonElement = document.createElement('div');
  const buttonLink = document.createElement('a');
  const buttonIcon = document.createElement('img');

  buttonElement.className = 'changeset-button';
  buttonIcon.src = '../../buttons/mint-nft-32.png';
  buttonIcon.title = 'Clique para criar um NFT do changeset.';
  buttonIcon.className = 'img-button';

  buttonIcon.addEventListener('click', mintNFT);
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
  addButtonElement(changeset.status, newChansetElement);

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

export function showNewChangesets(changesets) {
  const contentBox = document.getElementById('content-box');

  removeContentCards(contentBox);

  if (changesets.getAllNew().length > 0) {
    for (const changeset of changesets.getAllNew()) {
      addChangesetElement(changeset, contentBox);
    }
  }
}

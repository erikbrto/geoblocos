import { OSM_ROOT_URL } from '../utils/constants.js';
import { viewLinkOnAtiveTab } from './common.js';

export class MyChangesetsView {
  constructor(changesets) {
    this.changesets = changesets;
  }

  show() {
    const contentBox = document.getElementById('content-box');

    if (this.changesets.getAllNew().length > 0) {
      for (const changeset of this.changesets.getAllNew()) {
        this.addChangesetElement(changeset, contentBox);
      }
    }
  }

  async mintNFT(event) {
    event.stopPropagation();
    event.target.src = '../../buttons/loading-32.png';
    event.target.style = 'transform: scale(1)';
    const changesetId =
      event.target.parentNode.parentNode.parentNode.parentNode.getAttribute(
        'changesetid'
      );

    if (await ethutils.mintChangeset(changesetId)) {
      event.target.src = '../../buttons/view-nft-32.png';
    } else {
      event.target.src = '../../buttons/mint-nft-32.png';
    }
    event.target.style = null;
  }
  
  addChangesetElement(changeset, parentNode) {
    const newChangesetElement = document.createElement('div');
    const newChangesetRow = document.createElement('div');

    newChangesetRow.className = 'changeset-row';

    this.addChangesetTitle(changeset.id, newChangesetRow);
    this.addButtonElement(newChangesetRow);

    // Alterações no elemento do changeset
    newChangesetElement.id = `changeset-${changeset.id}`;
    newChangesetElement.className = 'content-card';
    newChangesetElement.setAttribute('changesetId', changeset.id);

    newChangesetElement.appendChild(newChangesetRow);
    parentNode.appendChild(newChangesetElement);
  }

  addChangesetTitle(changesetId, parentNode) {
    const changesetTitleElement = document.createElement('a');

    // Alterações no campo de título do changeset
    changesetTitleElement.textContent = changesetId;
    changesetTitleElement.className = 'changeset-title';
    changesetTitleElement.href = `${OSM_ROOT_URL}/changeset/${changesetId}`;
    changesetTitleElement.title =
      'Pressione [CTRL + Clique] para abrir em uma nova aba.';

    changesetTitleElement.addEventListener('click', viewLinkOnAtiveTab);
    parentNode.appendChild(changesetTitleElement);
  }

  addButtonElement(parentNode) {
    const buttonElement = document.createElement('div');
    const buttonLink = document.createElement('a');
    const buttonIcon = document.createElement('img');

    buttonElement.className = 'changeset-button';
    buttonIcon.src = '../../buttons/mint-nft-32.png';
    buttonIcon.title = 'Clique para criar um NFT do changeset.';
    buttonIcon.className = 'img-button';

    buttonIcon.addEventListener('click', this.mintNFT);
    buttonLink.appendChild(buttonIcon);
    buttonElement.appendChild(buttonLink);
    parentNode.appendChild(buttonElement);
  }
}

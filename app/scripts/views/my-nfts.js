import { OSM_ROOT_URL } from '../utils/constants.js';
import { viewLinkOnAtiveTab } from './common.js';

export class MyNFTsView {
  constructor(changesets) {
    this.changesets = changesets;
  }

  show() {
    const contentBox = document.getElementById('content-box');

    if (this.changesets.getAllMinted().length > 0) {
      for (const changeset of this.changesets.getAllMinted()) {
        this.addChangesetElement(changeset, contentBox);
      }
    }
  }

  openNftPage(event) {
    event.stopPropagation();
    chrome.tabs.create({
      url: event.target.parentNode.href,
      active: true,
    });
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
    this.addProjectsElement(changeset.projects, newChangesetElement);
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
    buttonLink.href = 'https://goerli.etherscan.io/';
    buttonIcon.src = '../../buttons/view-nft-32.png';
    buttonIcon.title = 'Clique para ver os detalhes do NFT.';
    buttonIcon.className = 'img-button';
  
    buttonIcon.addEventListener('click', this.openNftPage);
    buttonLink.appendChild(buttonIcon);
    buttonElement.appendChild(buttonLink);
    parentNode.appendChild(buttonElement);
  }

  addProjectsElement(projects, parentNode) {
    const projectsInfoElement = document.createElement('div');
    const projectsListElement = document.createElement('ul');

    projectsInfoElement.innerText = 'Projetos atendidos:';
    projectsInfoElement.className = 'attributes-info';
    projectsListElement.className = 'attributes-list';

    for (const project of projects) {
      const projectElement = document.createElement('li');
      projectElement.textContent = `${project.name} (${project.areaName})`;
      projectsListElement.appendChild(projectElement);
    }

    projectsInfoElement.appendChild(projectsListElement);
    parentNode.appendChild(projectsInfoElement);
  }
}

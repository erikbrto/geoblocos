import { ContentSelection } from '../models/enums.js';
import { fetchUserChangesets } from './osm-api.js';
import { showUsername, showMetaMaskStatus } from '../views/header.js';
import { showNewChangesets } from '../views/my-changesets.js';
import { showMintedChangesets } from '../views/my-nfts.js';
import { showOpenProjects } from '../views/open-projects.js';
import { showMyProjects } from '../views/my-projects.js';

(() => {
  let loggedUser;

  function fillHeader() {
    chrome.runtime.sendMessage({ type: 'GET-USERNAME' }, (response) => {
      const { type, data } = response;

      if (type === 'SET-USERNAME') {
        loggedUser = data.username;

        showUsername(loggedUser);
        ethutils.checkMetaMaskStatus().then(showMetaMaskStatus);
      }
    });
  }

  function fillContentBox(contentSelecion) {
    switch (contentSelecion) {
      case ContentSelection.MyChangesets:
        fetchUserChangesets(loggedUser).then(showNewChangesets);
        break;

      case ContentSelection.MyNFTs:
        fetchUserChangesets(loggedUser).then(showMintedChangesets);
        break;

      case ContentSelection.OpenProjects:
        showOpenProjects();
        break;

      case ContentSelection.MyProjects:
        showMyProjects();
        break;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Atualização no painel lateral do nome de usuário logado
    // e busca dos changesets enviados por ele
    fillHeader();
  });

  const contentSelector = document.getElementById('content-selector');
  contentSelector.addEventListener('click', (event) => {
    fillHeader();
    fillContentBox(event.target.value);
  });
})();

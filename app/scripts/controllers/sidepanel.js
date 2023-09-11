import { ContentSelection } from '../models/enums.js';
import { fetchUserChangesets } from './osm-api.js';
import { HeadersView } from '../views/header.js';
import { MyChangesetsView } from '../views/my-changesets.js';
import { MyNFTsView } from '../views/my-nfts.js';
import { MyProjectsView } from '../views/my-projects.js';
import { OpenProjectsView } from '../views/open-projects.js';
import {
  removeAllProjectsElements,
  removeContentCards,
  removeMyProjectsElements,
  removeOpenProjectsElements,
} from '../views/common.js';

import { MappingProject } from '../models/mapping-project.js';
import { OpenProjects } from '../models/open-projects.js';

function fetchOpenProjects() {
  const cruzeiro = new MappingProject(
    1,
    'Mapeamento da região do Cruzeiro',
    'bernardo25',
    3359467,
    'Cruzeiro',
    new Set(['Rua 1', 'Rua 2', 'Rua 3']),
    new Set(['school', 'hospital', 'parking-lot'])
  );
  const sudoeste = new MappingProject(
    2,
    'Inserir mapa do Sudoeste',
    'Fidelis Assis',
    3359488,
    'Sudoeste e Octogonal',
    new Set(['Rua 1', 'Rua 2', 'Rua 3']),
    new Set(['school', 'hospital', 'parking-lot'])
  );
  const projects = new OpenProjects();
  projects.insert(cruzeiro);
  projects.insert(sudoeste);

  return projects;
}

class SidepanelController {
  static loggedUser;
  static metamaskStatus;
  static userChangesets;
  static openProjects;

  static init() {
    const contentSelector = document.getElementById('content-selector');

    document.addEventListener('DOMContentLoaded', async () => {
      // Atualização no painel lateral do nome de usuário logado
      // e busca dos changesets enviados por ele
      this.fillHeader();
      this.fillContentBox(ContentSelection.MyChangesets);
    });
    document.addEventListener('focus', async () => this.fillHeader());
    contentSelector.addEventListener('click', async (event) => {
      this.fillHeader();
      this.fillContentBox(event.target.value);
    });
  }

  static async fillHeader() {
    chrome.runtime.sendMessage({ type: 'GET-USERNAME' }, async (response) => {
      const { type, data } = response;

      if (type === 'SET-USERNAME') {
        this.loggedUser = data.username;
        this.metamaskStatus = await ethutils.checkMetaMaskStatus();

        const headersView = new HeadersView(
          this.loggedUser,
          this.metamaskStatus
        );
        headersView.show();
      }
    });
  }

  static async fillContentBox(contentSelecion) {
    while (this.loggedUser === undefined) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    this.userChangesets = await fetchUserChangesets(this.loggedUser);
    this.openProjects = fetchOpenProjects();

    removeContentCards();

    switch (contentSelecion) {
      case ContentSelection.MyChangesets:
        let myChagesetsView = new MyChangesetsView(this.userChangesets);
        removeAllProjectsElements();
        myChagesetsView.show();
        break;

      case ContentSelection.MyNFTs:
        let myNFTsView = new MyNFTsView(this.userChangesets);
        removeAllProjectsElements();
        myNFTsView.show();
        break;

      case ContentSelection.OpenProjects:
        let openProjectsView = new OpenProjectsView(this.openProjects);
        removeMyProjectsElements();
        openProjectsView.show();
        break;

      case ContentSelection.MyProjects:
        let myProjectsView = new MyProjectsView(
          this.openProjects,
          this.loggedUser
        );
        removeOpenProjectsElements();
        myProjectsView.show();
        break;
    }
  }
}

SidepanelController.init();

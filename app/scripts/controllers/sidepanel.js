import { ContentSelection } from '../models/enums.js';
import { fetchUserChangesets } from './osm-api.js';
import { HeadersView } from '../views/header.js';
import { MyChangesetsView } from '../views/my-changesets.js';
import { MyNFTsView } from '../views/my-nfts.js';
import { MyProjectsView } from '../views/my-projects.js';
import { OpenProjectsView } from '../views/open-projects.js';
import { showLoadingSpinner, removeLoadingSpinner } from '../views/common.js';

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
    contentSelector.addEventListener('click', async (event) => {
      event.stopPropagation();
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

    showLoadingSpinner();
    this.openProjects = await ethutils.fetchOpenProjects();
    this.userChangesets = await fetchUserChangesets(this.loggedUser, this.openProjects);
    removeLoadingSpinner();

    switch (contentSelecion) {
      case ContentSelection.MyChangesets:
        let myChagesetsView = new MyChangesetsView(this.userChangesets);
        myChagesetsView.show();
        break;

      case ContentSelection.MyNFTs:
        let myNFTsView = new MyNFTsView(this.userChangesets);
        myNFTsView.show();
        break;

      case ContentSelection.OpenProjects:
        let openProjectsView = new OpenProjectsView(this.openProjects);
        openProjectsView.show();
        break;

      case ContentSelection.MyProjects:
        let myProjectsView = new MyProjectsView(
          this.openProjects,
          this.loggedUser
        );
        myProjectsView.show();
        break;
    }
  }
}

SidepanelController.init();

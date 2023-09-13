import { CreateProjectView } from '../views/create-project.js';

class CreateProjectController {
  static loggedUser;

  static async init() {
    await this.fetchUserName();

    let createProjectView = new CreateProjectView(this.loggedUser);
    createProjectView.show();    
  }

  static async fetchUserName() {
    chrome.runtime.sendMessage({ type: 'GET-USERNAME' }, async (response) => {
      const { type, data } = response;

      if (type === 'SET-USERNAME') {
        this.loggedUser = data.username;
      }
    });
  }
}

CreateProjectController.init();

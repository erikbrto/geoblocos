import { CreateProjectView } from '../views/create-project.js';

class CreateProjectController {
  static async init() {
    chrome.runtime.sendMessage({ type: 'GET-USERNAME' }).then((response) => {
      const { type, data } = response;

      if (type === 'SET-USERNAME') {
        let createProjectView = new CreateProjectView(data.username);
        createProjectView.show();
      }
    });
  }
}

CreateProjectController.init();

import { OSM_ROOT_URL } from '../utils/constants.js';
import { SidePanelPage } from '../models/enums.js';
import {
  removeContentCards,
  viewLinkOnAtiveTab,
  changeSidePanelPage,
} from './common.js';

export class MyProjectsView {
  constructor(projects, username) {
    this.projects = projects;
    this.username = username;
  }

  show(filter = null) {
    const contentBox = document.getElementById('content-box');
    let projectsToShow = this.projects.getAllFromUser(this.username);

    if (document.getElementById('my-projects-search-bar') === null) {
      this.addSearchBar(contentBox);
    } else if (filter !== null) {
      projectsToShow = projectsToShow.filter(
        (project) =>
          project.name.toLowerCase().includes(filter) ||
          project.relationName.toLowerCase().includes(filter)
      );
      removeContentCards();
    }

    if (document.getElementById('create-project') === null) {
      this.addCreateProjectButton(contentBox);
    }

    if (projectsToShow.length > 0) {
      for (const project of projectsToShow) {
        this.addProjectElement(project, contentBox);
      }
    }
  }

  addSearchBar(parentNode) {
    const inputFieldElement = document.createElement('div');
    const searchBarElement = document.createElement('input');

    inputFieldElement.id = 'my-projects-search-bar';
    inputFieldElement.className = 'input-field';
    searchBarElement.type = 'search';
    searchBarElement.className = 'input-text';
    searchBarElement.placeholder = 'Pesquisar projetos...';

    searchBarElement.addEventListener('keyup', (event) => {
      new Promise((resolve) => setTimeout(resolve, 1000));
      const filter = event.target.value.toLowerCase();
      this.show(filter);
    });

    inputFieldElement.appendChild(searchBarElement);
    parentNode.appendChild(inputFieldElement);
  }

  addCreateProjectButton(parentNode) {
    const createProjectElement = document.createElement('div');
    const createProjectButtonElement = document.createElement('button');

    createProjectElement.id = 'create-project';
    createProjectElement.className = 'input-field';
    createProjectButtonElement.innerText = '+';
    createProjectButtonElement.className = 'create-project-button';

    createProjectButtonElement.addEventListener('click', (event) => {
      event.stopPropagation();
      changeSidePanelPage(SidePanelPage.CreateProject);
    });
    createProjectElement.appendChild(createProjectButtonElement);
    parentNode.appendChild(createProjectElement);
  }

  addProjectElement(project, parentNode) {
    const newProjectElement = document.createElement('div');

    this.addProjectName(project.name, newProjectElement);
    this.addRelationInfo(
      project.relationId,
      project.relationName,
      newProjectElement
    );
    this.addAmenitiesInfo(project.acceptedAmenities, newProjectElement);

    // Alterações no elemento do changeset
    newProjectElement.id = `project-${project.id}`;
    newProjectElement.className = 'content-card';
    newProjectElement.setAttribute('projectId', project.id);

    parentNode.appendChild(newProjectElement);
  }

  addProjectName(name, parentNode) {
    const projectNameElement = document.createElement('div');

    // Alterações no campo de título do changeset
    projectNameElement.innerText = name;
    projectNameElement.className = 'project-name';

    parentNode.appendChild(projectNameElement);
  }

  addRelationInfo(relationId, relationName, parentNode) {
    const relationInfoElement = document.createElement('div');
    const brElement = document.createElement('br');
    const relationLinkElement = document.createElement('a');

    relationInfoElement.innerText = 'Região a ser mapeada: ';
    relationInfoElement.className = 'relation-info';

    relationLinkElement.textContent = relationName;
    relationLinkElement.className = 'relation-link';
    relationLinkElement.href = `${OSM_ROOT_URL}/relation/${relationId}`;
    relationLinkElement.title =
      'Pressione [CTRL + Clique] para abrir em uma nova aba.';

    relationLinkElement.addEventListener('click', viewLinkOnAtiveTab);
    relationInfoElement.appendChild(brElement);
    relationInfoElement.appendChild(relationLinkElement);
    parentNode.appendChild(relationInfoElement);
  }

  addAmenitiesInfo(amenities, parentNode) {
    const amenitiesInfoElement = document.createElement('div');
    const amenitiesListElement = document.createElement('ul');

    amenitiesInfoElement.innerText = 'Amenities aceitas: ';
    amenitiesInfoElement.className = 'amenities-info';
    amenitiesListElement.className = 'amenities-list';

    for (const amenity of amenities.values()) {
      const amenityElement = document.createElement('li');
      amenityElement.textContent = amenity;
      amenitiesListElement.appendChild(amenityElement);
    }

    amenitiesInfoElement.appendChild(amenitiesListElement);
    parentNode.appendChild(amenitiesInfoElement);
  }
}

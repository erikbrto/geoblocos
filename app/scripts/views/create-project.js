import { OSM_API_URL, OSM_ROOT_URL } from '../utils/constants.js';
import { SidePanelPage } from '../models/enums.js';
import { amenity } from '../models/osm-attributes.js';
import { changeSidePanelPage, viewLinkOnAtiveTab } from './common.js';

export class CreateProjectView {
  constructor(username) {
    this.username = username;
  }

  show() {
    this.activateProjectNameInput();
    this.activateRelationIdInput();
    this.fillFieldset('amenities-fieldset', amenity);
    this.activateCreateProjectButton();
    this.activateCancelButton();
  }

  activateProjectNameInput() {
    const projectNameInput = document.getElementById('project-name-input');
    const projectNameDiv = projectNameInput.parentElement;

    projectNameInput.addEventListener('input', (event) => {
      const projectName = event.target.value;
      const isValid = this.validateInputText(
        '^[A-ZÁÉÓÂÔ][A-Za-zÁ-Úá-úÂÊÔâêôÃÕãõÇç:o0-9- ]*$',
        projectName
      );

      if (isValid || projectName === '') {
        this.removeErrorMessage(projectNameDiv);
      } else {
        this.addErrorMessage(
          'O nome deve conter apenas caracteres alfanuméricos e começar com uma letra maiúscula',
          projectNameDiv
        );
      }
    });
  }

  activateRelationIdInput() {
    const relationIdInput = document.getElementById('relation-id-input');
    const relationIdDiv = relationIdInput.parentElement;

    relationIdInput.addEventListener('input', async (event) => {
      const relationId = event.target.value;
      const isValid = this.validateInputText('^[0-9]+$', relationId);
      const osmIdExists = await fetch(
        `${OSM_API_URL}/relation/${relationId}.json`
      );

      if (osmIdExists.ok || relationId === '') {
        this.removeErrorMessage(relationIdDiv);
        if (osmIdExists.ok) {
          const osmRelation = await osmIdExists.json();
          this.addSuccessMessage(
            `Relation: ${osmRelation.elements[0]?.tags?.name}`,
            relationIdDiv
          );
        }
      } else if (isValid) {
        this.removeSuccessMessage(relationIdDiv);
        this.addErrorMessage(
          'O ID não existe na base de dados do OpenStreetMap',
          relationIdDiv
        );
      } else {
        this.removeSuccessMessage(relationIdDiv);
        this.addErrorMessage(
          'O ID deve conter apenas caracteres númericos',
          relationIdDiv
        );
      }
    });
  }

  activateCreateProjectButton() {
    const createProjectButton = document.getElementById(
      'create-project-button'
    );
    createProjectButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      const projectNameInput = document.getElementById('project-name-input');
      const relationIdInput = document.getElementById('relation-id-input');
      const amenitiesFieldset = document.getElementById('amenities-fieldset');
      const amenitiesButtons =
        amenitiesFieldset.querySelectorAll('.fieldset-button');
      const amenities = [];

      for (const button of amenitiesButtons) {
        if (button.getAttribute('isSelected') === 'true') {
          amenities.push(button.value);
        }
      }

      const project = {
        name: projectNameInput.value,
        relationId: relationIdInput.value,
        amenities: amenities,
      };

      this.validateProject(project).then((isValid) => {
        if (!isValid) return;

        console.log(project);
        changeSidePanelPage(SidePanelPage.Home);
      });
    });
  }

  async validateProject(project) {
    const regexProjectName = new RegExp(
      '^[A-ZÁÉÓÂÔ][A-Za-zÁ-Úá-úÂÊÔâêôÃÕãõÇç:o0-9- ]*$'
    );
    const regexRelationId = new RegExp('^[0-9]+$');
    const osmIdExists = await fetch(
      `${OSM_API_URL}/relation/${project.relationId}.json`
    );

    return (
      regexProjectName.test(project.name) &&
      regexRelationId.test(project.relationId) &&
      osmIdExists.ok &&
      project.amenities.length > 0
    );
  }

  activateCancelButton() {
    const cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', (event) => {
      event.stopPropagation();
      changeSidePanelPage(SidePanelPage.Home);
    });
  }

  fillFieldset(fieldsetId, data) {
    const amenitiesFieldset = document.getElementById(fieldsetId);

    for (const [key, values] of Object.entries(data)) {
      const buttonsGroup = document.createElement('div');
      const keyLabel = document.createElement('label');

      buttonsGroup.classList.add('fieldset-group');
      keyLabel.textContent = key;
      keyLabel.classList.add('fieldset-label');
      amenitiesFieldset.appendChild(keyLabel);

      for (const value of values) {
        const valueButton = document.createElement('input');

        valueButton.type = 'button';
        valueButton.value = value;
        valueButton.classList.add('fieldset-button');
        valueButton.setAttribute('isSelected', false);

        valueButton.addEventListener('click', (event) => {
          event.stopPropagation();
          this.toggleFieldsetButton(event.target);
        });
        buttonsGroup.appendChild(valueButton);
      }

      amenitiesFieldset.appendChild(buttonsGroup);
    }
  }

  validateInputText(regexPattern, inputText) {
    const regex = new RegExp(regexPattern);
    return regex.test(inputText);
  }

  addSuccessMessage(message, divElement) {
    if (!this.checkContainsSuccessMessage(divElement)) {
      const successMessage = document.createElement('label');

      successMessage.classList.add('success-message');
      successMessage.textContent = message;

      divElement.appendChild(successMessage);
    }
  }

  addErrorMessage(message, divElement) {
    if (!this.checkContainsErrorMessage(divElement)) {
      const inputElement = divElement.querySelector('input');
      const errorMessage = document.createElement('label');

      inputElement.style = 'border-color: red;';
      errorMessage.classList.add('error-message');
      errorMessage.textContent = message;

      divElement.appendChild(errorMessage);
    }
  }

  removeSuccessMessage(divElement) {
    const inputElement = divElement.querySelector('input');
    const errorMessage = divElement.querySelector('.success-message');
    inputElement.style = null;
    errorMessage?.remove();
  }

  removeErrorMessage(divElement) {
    const inputElement = divElement.querySelector('input');
    const errorMessage = divElement.querySelector('.error-message');
    inputElement.style = null;
    errorMessage?.remove();
  }

  checkContainsSuccessMessage(divElement) {
    const errorMessage = divElement.querySelector('.success-message');
    return errorMessage !== null;
  }

  checkContainsErrorMessage(divElement) {
    const errorMessage = divElement.querySelector('.error-message');
    return errorMessage !== null;
  }

  toggleFieldsetButton(button) {
    const isSelected = button.getAttribute('isSelected') === 'true';
    button.setAttribute('isSelected', !isSelected);
  }
}

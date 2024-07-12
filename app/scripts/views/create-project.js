import { OSM_API_URL, OSM_ROOT_URL } from '../utils/constants.js';
import { AreaType } from '../models/enums.js';
import { SidePanelPage } from '../models/enums.js';
import { amenity } from '../models/osm-attributes.js';
import { changeSidePanelPage } from './common.js';

export class CreateProjectView {
  areaType = AreaType.Relation;

  constructor(username) {
    this.username = username;
  }

  show() {
    this.activateProjectNameInput();
    this.activateAreaTypeSelector();
    this.activateAreaIdInput();
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

  activateAreaTypeSelector() {
    const areaTypeSelector = document.getElementById('area-type-selector');

    areaTypeSelector.addEventListener('change', (event) => {
      const selectedAreaType = event.target.value;
      this.areaType = selectedAreaType;
    });
  }

  activateAreaIdInput() {
    const areaIdInput = document.getElementById('area-id-input');
    const areaIdDiv = areaIdInput.parentElement;

    areaIdInput.addEventListener('input', async (event) => {
      const areaId = event.target.value;
      const isValid = this.validateInputText('^[0-9]+$', areaId);
      const osmIdExists = await fetch(
        `${OSM_API_URL}/${this.areaType}/${areaId}.json`
      );

      if (osmIdExists.ok || areaId === '') {
        this.removeErrorMessage(areaIdDiv);
        if (osmIdExists.ok) {
          const osmArea = await osmIdExists.json();
          this.addSuccessMessage(
            `${this.capitalizeFirstLetter(this.areaType)}: ${
              osmArea.elements[0]?.tags?.name
            }`,
            areaIdDiv
          );
        }
      } else if (isValid) {
        this.removeSuccessMessage(areaIdDiv);
        this.addErrorMessage(
          'O ID não existe na base de dados do OpenStreetMap',
          areaIdDiv
        );
      } else {
        this.removeSuccessMessage(areaIdDiv);
        this.addErrorMessage(
          'O ID deve conter apenas caracteres númericos',
          areaIdDiv
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
      const areaIdInput = document.getElementById('area-id-input');
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
        areaId: areaIdInput.value,
        validKeys: {
          amenity: amenities,
        },
      };

      this.validateProject(project).then((isValid) => {
        if (!isValid) return;

        ethutils.createProject(
          project.name,
          this.username,
          this.areaType,
          project.areaId,
          project.validKeys
        ).then(
          (isCreated) => {
            console.log(isCreated 
              ? 'Projeto criado com sucesso!' 
              : 'Erro ao criar projeto!');
            changeSidePanelPage(SidePanelPage.Home);
          }
        );
      });
    });
  }

  async validateProject(project) {
    const regexProjectName = new RegExp(
      '^[A-ZÁÉÓÂÔ][A-Za-zÁ-Úá-úÂÊÔâêôÃÕãõÇç:o0-9- ]*$'
    );
    const regexAreaId = new RegExp('^[0-9]+$');
    const osmIdExists = await fetch(
      `${OSM_API_URL}/${this.areaType}/${project.areaId}.json`
    );

    return (
      regexProjectName.test(project.name) &&
      regexAreaId.test(project.areaId) &&
      osmIdExists.ok
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
    const fieldset = document.getElementById(fieldsetId);
    const fieldsetDiv = document.createElement('div');

    fieldsetDiv.classList.add('fieldset-div');
    fieldsetDiv.hidden = true;

    for (const [key, values] of Object.entries(data)) {
      const buttonsGroup = document.createElement('div');
      const keyLabel = document.createElement('label');

      buttonsGroup.classList.add('fieldset-group');
      keyLabel.textContent = key;
      keyLabel.classList.add('fieldset-label');
      fieldsetDiv.appendChild(keyLabel);

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

      fieldsetDiv.appendChild(buttonsGroup);
    }

    fieldset.addEventListener('click', (event) => {
      event.stopPropagation();
      this.toggleFieldset(fieldsetDiv);
    });
    fieldset.appendChild(fieldsetDiv);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

  toggleFieldset(fieldsetDiv) {
    fieldsetDiv.hidden = !fieldsetDiv.hidden;
  }

  toggleFieldsetButton(button) {
    const isSelected = button.getAttribute('isSelected') === 'true';
    button.setAttribute('isSelected', !isSelected);
  }
}

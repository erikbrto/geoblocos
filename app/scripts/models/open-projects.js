import { MappingProject } from './mapping-project.js';

export class OpenProjects {
  #data;

  constructor() {
    this.#data = [];
  }

  #checkIdExists(id) {
    return this.#data.filter((item) => item.id === id).length > 0
      ? true
      : false;
  }

  insert(id, username, relationId, relationName, relationNodes, acceptedAmenities) {
    if (!this.#checkIdExists(id)) {
      const project = new MappingProject(
        id,
        username,
        relationId,
        relationName,
        relationNodes,
        acceptedAmenities
      );

      this.#data.push(project);
    }
  }

  get(id) {
    return this.#data.length > 0
      ? this.#data.filter((item) => item.id === id)[0]
      : [];
  }

  getAll() {
    return this.#data
      .sort((a, b) => (a.relationName < b.relationName ? -1 : 1))
  }

  delete(id) {
    this.#data = this.#data.filter((item) => item.id !== id);
  }

  deleteAll() {
    this.#data = [];
  }
}

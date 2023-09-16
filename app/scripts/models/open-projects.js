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

  insert(project) {
    if (!this.#checkIdExists(project.id)) {
      this.#data.push(project);
    }
  }

  get(id) {
    return this.#data.length > 0
      ? this.#data.filter((item) => item.id === id)[0]
      : [];
  }

  getAll() {
    return this.#data.sort((a, b) => (a.areaName < b.areaName ? -1 : 1));
  }

  getAllFromUser(username) {
    return this.#data
      .filter((item) => item.username === username)
      .sort((a, b) => (a.areaName < b.areaName ? -1 : 1));
  }

  delete(id) {
    this.#data = this.#data.filter((item) => item.id !== id);
  }

  deleteAll() {
    this.#data = [];
  }
}

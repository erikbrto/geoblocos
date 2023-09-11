import { MappingChangeset } from './mapping-changeset.js';
import { ChangetsetStatus } from './enums.js';

export class UserChangesets {
  #data = [];

  constructor(username) {
    this.username = username;
  }

  #checkIdExists(id) {
    return this.#data.filter((item) => item.id === id).length > 0
      ? true
      : false;
  }

  insert(changeset) {
    if (!this.#checkIdExists(changeset.id)) {
      this.#data.push(changeset);
    }
  }

  get(id) {
    return this.#data.length > 0
      ? this.#data.filter((item) => item.id === id)[0]
      : [];
  }

  getAll() {
    return this.#data
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .sort((a, b) => (a.status < b.status ? -1 : 1));
  }

  getAllNew() {
    return this.#data
      .filter((item) => item.status === ChangetsetStatus.New)
      .sort((a, b) => (a.id < b.id ? -1 : 1));
  }

  getAllMinted() {
    return this.#data
      .filter((item) => item.status === ChangetsetStatus.Minted)
      .sort((a, b) => (a.id < b.id ? -1 : 1));
  }

  delete(id) {
    this.#data = this.#data.filter((item) => item.id !== id);
  }

  deleteAll() {
    this.#data = [];
  }
}

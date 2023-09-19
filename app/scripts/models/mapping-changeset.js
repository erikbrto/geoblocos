export class MappingChangeset {
  constructor(id, changesetStatus, nodes, projects) {
    this.id = id;
    this.status = changesetStatus;
    this.nodes = nodes;
    this.projects = projects;
    this.tokenURI = null;
  }
}

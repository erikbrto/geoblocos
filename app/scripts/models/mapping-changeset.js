export class MappingChangeset {
  constructor(id, changesetStatus, minCoortinates, maxCoordinates, keys) {
    this.id = id;
    this.status = changesetStatus;
    this.minCoortinates = minCoortinates;
    this.maxCoordinates = maxCoordinates;
    this.keys = keys;
    this.tokenURI = null;
  }
}

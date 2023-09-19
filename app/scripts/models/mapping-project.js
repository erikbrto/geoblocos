export class MappingProject {
  constructor(
    id,
    name,
    username,
    areaType,
    areaId,
    areaName,
    validNodes,
    validKeys
  ) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.areaType = areaType;
    this.areaId = areaId;
    this.areaName = areaName;
    this.validNodes = validNodes;
    this.validKeys = validKeys;
  }
}

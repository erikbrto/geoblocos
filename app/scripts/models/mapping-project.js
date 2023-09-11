export class MappingProject {
    constructor(id, name, username, relationId, relationName, relationNodes, acceptedAmenities){
        this.id = id;
        this.name = name;
        this.username = username;
        this.relationId = relationId;
        this.relationName = relationName;
        this.relationNodes = relationNodes;
        this.acceptedAmenities = acceptedAmenities;
    }
}
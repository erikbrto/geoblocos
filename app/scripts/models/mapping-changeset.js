export class MappingChangeset {
    constructor(id, changesetStatus, minCoortinates, maxCoordinates, amenities){
        this.id = id;
        this.status = changesetStatus;
        this.minCoortinates = minCoortinates;
        this.maxCoordinates = maxCoordinates;
        this.amenities = amenities;
        this.tokenURI = null;
    }
}
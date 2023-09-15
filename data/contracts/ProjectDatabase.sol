// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProjectDatabase {
    uint24 internal currentId = 0;
    mapping (uint24 => address) internal projectOwner;
    mapping (uint24 => Project) public projects;

    enum AreaType {
        Relation,
        Way
    }

    struct Project {
        uint24 id;
        string name;
        string creator;
        AreaType areaType;
        uint64 areaId;
        string jsonValidKeys;
    }
    
    function getNextId() 
        private 
        returns (uint24) 
    {
        return currentId++;
    }

    
    function compareStrings(string memory a, string memory b)
        private
        pure
        returns (bool)
    {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function createProject(string memory name, string memory creator, AreaType areaType, uint64 areaId, string memory jsonValidKeys) 
        public 
        returns (uint24)
    {
        require(bytes(name).length > 0, "Invalid project name.");
        require(bytes(creator).length > 0, "Invalid creator name.");
        require(areaId != 0, "Invalid area ID.");
        require(bytes(jsonValidKeys).length > 1, "Invalid validation keys.");

        uint24 id = getNextId();
        projects[id] = Project(id, name, creator, areaType, areaId, jsonValidKeys);
        projectOwner[id] = msg.sender;

        return id;
    }

    function searchProjects(AreaType areaType) 
        public 
        view
        returns (Project[] memory)
    {
        Project[] memory result;
        uint24 resultLength = 0;
        uint24 resultIndex = 0;

        for (uint24 i = 0; i < currentId; i++) {
            if (areaType == projects[i].areaType) {
                resultLength++;
            }
        }
        
        result = new Project[](resultLength);

        for (uint24 i = 0; i < currentId; i++) {
            if (areaType == projects[i].areaType) {
                result[resultIndex] = projects[i];
                resultIndex++;
            }
        }

        return result;
    }

    function searchProjects(uint64 areaId) 
        public 
        view
        returns (Project[] memory)
    {
        Project[] memory result;
        uint24 resultLength = 0;
        uint24 resultIndex = 0;

        for (uint24 i = 0; i < currentId; i++) {
            if (areaId == projects[i].areaId) {
                resultLength++;
            }
        }
        
        result = new Project[](resultLength);

        for (uint24 i = 0; i < currentId; i++) {
            if (areaId == projects[i].areaId) {
                result[resultIndex] = projects[i];
                resultIndex++;
            }
        }

        return result;
    }
    
    function searchProjects(string memory creator) 
        public 
        view
        returns (Project[] memory)
    {
        Project[] memory result;
        uint24 resultLength = 0;
        uint24 resultIndex = 0;

        for (uint24 i = 0; i < currentId; i++) {
            if (compareStrings(creator, projects[i].creator)) {
                resultLength++;
            }
        }
        
        result = new Project[](resultLength);

        for (uint24 i = 0; i < currentId; i++) {
            if (compareStrings(creator, projects[i].creator)) {
                result[resultIndex] = projects[i];
                resultIndex++;
            }
        }

        return result;
    }

    function getAllActive()
        public
        view
        returns (Project[] memory)
    {
        Project[] memory result;
        uint24 resultLength = 0;
        uint24 resultIndex = 0;

        for (uint24 i = 0; i < currentId; i++) {
            if (projects[i].areaId != 0) {
                resultLength++;
            }
        }
        
        result = new Project[](resultLength);

        for (uint24 i = 0; i < currentId; i++) {
            if (projects[i].areaId != 0) {
                result[resultIndex] = projects[i];
                resultIndex++;
            }
        }

        return result;
    }

    function getProjectName(uint24 id) 
        public 
        view 
        returns (string memory) 
    {
        require(id < currentId, "Project ID doesn't exist");
        return projects[id].name;
    }

    function getProjectCreator(uint24 id) 
        public 
        view 
        returns (string memory) 
    {
        require(id < currentId, "Project ID doesn't exist");
        return projects[id].creator;
    }


    function getProjectAreaType(uint24 id) 
        public 
        view 
        returns (AreaType) 
    {
        require(id < currentId, "Project ID doesn't exist");
        return projects[id].areaType;
    }

    function getProjectAreaId(uint24 id) 
        public 
        view 
        returns (uint64) 
    {
        require(id < currentId, "Project ID doesn't exist");
        return projects[id].areaId;
    }

    function getProjectValidKeys(uint24 id) 
        public 
        view 
        returns (string memory) 
    {
        require(id < currentId, "Project ID doesn't exist");
        return projects[id].jsonValidKeys;
    }

    function deleteProject(uint24 id) 
        public 
    {
        require(id < currentId, "Project ID doesn't exist");
        require(projectOwner[id] == msg.sender, "Sender isn't the creator of the project.");
        Project memory oldProject = projects[id];

        if (bytes(oldProject.name).length > 0) {
            delete projects[id];
        }
    }
}
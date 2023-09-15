// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MappingNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint64 => uint256) public mintedChangesets;

    constructor() ERC721("MappingNFT", "CST") {}

    function mintChangesetNFT(address userOSM, uint64 changesetId, string memory tokenURI)
        public 
        returns (uint256)
    {
        require(mintedChangesets[changesetId] == 0, "Changeset already minted!");
        _tokenIds.increment();
        
        uint256 newTokenId = _tokenIds.current();
        _mint(userOSM, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        mintedChangesets[changesetId] = newTokenId;

        return newTokenId;
    }
}

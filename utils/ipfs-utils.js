const {
  NFT_STORAGE_API_KEY,
  OSM_API_URL,
} = require('../app/scripts/utils/constants');

async function storeBlobIPFS(blob) {
  const response = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
    },
    body: blob,
  })
    .then((response) => response.json())
    .catch(console.error);

  if (response.ok) return response.value.cid;
  console.log(`falha ao enviar arquivo de changeset: ${response}`);
}

async function getChangesetFile(changesetOriginUrl) {
  const resp = await fetch(changesetOriginUrl);

  if (!resp.ok)
    throw new Error(
      `error fetching json file: [${resp.statusCode}]: ${resp.status}`
    );
  return resp.blob();
}

async function storeChangesetIPFS(changesetFile) {
  const changesetJSON = JSON.parse(await changesetFile.text());

  delete changesetJSON.generator; // Removal of a variable key

  const content = new Blob([JSON.stringify(changesetJSON)], {
    type: 'application/json',
  });
  const changesetFileCID = await storeBlobIPFS(content);
  const osmUser = changesetJSON.elements[0].user;
  const osmUserID = changesetJSON.elements[0].uid;

  return {
    cid: changesetFileCID,
    user: osmUser,
    userID: osmUserID,
  };
}

async function storeChangesetNFT(changesetID) {
  const changesetOriginUrl = `${OSM_API_URL}/changeset/${changesetID}.json`;
  const changesetFile = await getChangesetFile(changesetOriginUrl);
  const changesetIPFS = await storeChangesetIPFS(changesetFile);

  const nftMetadata = {
    title: 'Mapping NFT Metadata',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: `OpenStreetMap changeset: ${changesetID}.`,
      },
      description: {
        type: 'string',
        description: `Changeset submitted from user (uid): ${changesetIPFS.user} (${changesetIPFS.userID}).`,
      },
      image: {
        type: 'string',
        description:
          'ipfs://bafkreie4cqltwljtmtmccztypjm2wrw6zg6rpxk3dgna4gcxwjiaqvgbya',
      },
      content: {
        type: 'string',
        description: `ipfs://${changesetIPFS.cid}`,
      },
      origin: {
        type: 'string',
        description: `${OSM_API_URL}/changeset/${changesetID}.json`,
      },
    },
  };

  const nft = new Blob([JSON.stringify(nftMetadata)], {
    type: 'application/json',
  });
  const nftCID = await storeBlobIPFS(nft);

  return `ipfs://${nftCID}`;
}

module.exports = {
  storeChangesetNFT,
};

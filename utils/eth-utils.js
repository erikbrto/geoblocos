const Web3 = require('web3');
const { createExternalExtensionProvider } = require('@metamask/providers');
const { fetchValidNodes } = require('../app/scripts/controllers/osm-api');
const { storeChangesetNFT } = require('./ipfs-utils');
const {
  MetaMaskStatus,
  AreaType,
  AreaTypeContract,
} = require('../app/scripts/models/enums');
const { MappingProject } = require('../app/scripts/models/mapping-project');
const { OpenProjects } = require('../app/scripts/models/open-projects');
const NFT_CONTRACT = require('../data/artifacts/contracts/MappingNFT.sol/MappingNFT.json');
const DATABASE_CONTRACT = require('../data/artifacts/contracts/ProjectDatabase.sol/ProjectDatabase.json');
const {
  OSM_API_URL,
  NFT_CONTRACT_ADRESS,
  DATABASE_CONTRACT_ADRESS,
  ETHEREUM_NETWORK,
} = require('../app/scripts/utils/constants');

let metamask;
let web3;

try {
  metamask = createExternalExtensionProvider();
  web3 = new Web3(metamask);
} catch (error) {
  console.log(error);
  web3 = undefined;
  metamask = undefined;
}

async function checkMetaMaskStatus() {
  if (metamask.chainId === null) return MetaMaskStatus.NotInstalled;
  else if (metamask.selectedAddress !== null) return MetaMaskStatus.Connected;
  else return MetaMaskStatus.Disconnected;
}

async function isChangesetMinted(changesetId) {
  try {
    const mappingContract = new web3.eth.Contract(
      NFT_CONTRACT.abi,
      NFT_CONTRACT_ADRESS
    );
    const resp = await mappingContract.methods
      .mintedChangesets(changesetId)
      .call();

    return resp !== 0n;
  } catch (error) {
    return false;
  }
}

async function fetchChangesetURI(changesetId) {
  const mappingContract = new web3.eth.Contract(
    NFT_CONTRACT.abi,
    NFT_CONTRACT_ADRESS
  );
  const tokenId = await mappingContract.methods
    .mintedChangesets(changesetId)
    .call();

  if (tokenId !== 0n) {
    const tokenURI = await mappingContract.methods.tokenURI(tokenId).call();

    return tokenURI;
  }
}

async function mintChangeset(changesetId) {
  if (await isChangesetMinted(changesetId)) return;

  let isMinted = false;
  const mappingContract = new web3.eth.Contract(
    NFT_CONTRACT.abi,
    NFT_CONTRACT_ADRESS
  );
  const ipfsChangesetNFT = await storeChangesetNFT(changesetId);

  try {
    await metamask.request({ method: 'eth_requestAccounts' });

    if (metamask.selectedAddress !== null) {
      const mintMethod = mappingContract.methods.mintChangesetNFT(
        metamask.selectedAddress,
        changesetId,
        ipfsChangesetNFT
      );
      const gasPrice = await web3.eth.getGasPrice();
      const estimatedGas = await mintMethod.estimateGas();
      const rawTx = {
        from: metamask.selectedAddress,
        to: NFT_CONTRACT_ADRESS,
        gas: estimatedGas,
        gasPrice: gasPrice,
        data: mintMethod.encodeABI(),
        chain: ETHEREUM_NETWORK,
      };

      await web3.eth
        .sendTransaction(rawTx)
        .on('transactionHash', (hash) => {
          console.log(`Hash da transação: ${hash}`);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log(confirmationNumber);
        })
        .on('receipt', (receipt) => {
          console.log(receipt);
          isMinted = receipt !== undefined;
        })
        .on('error', (error, receipt) => {
          console.log(`Erro ao realizar transação: ${error}`);
        });
    }
  } catch (error) {
    if (error.code === 4001) {
      console.log('Solicitação ao MetaMask não autorizada pelo usuário!');
    }

    console.log(`Erro ao mintar changeset (${changesetId}): ${error}`);
  }

  return isMinted;
}

function parseAreaType(areaType) {
  switch (areaType) {
    case AreaType.Relation:
      return AreaTypeContract.Relation;

    case AreaType.Way:
      return AreaTypeContract.Way;

    case AreaTypeContract.Relation:
      return AreaType.Relation;

    case AreaTypeContract.Way:
      return AreaType.Way;
  }
}

async function fetchAreaName(areaType, areaId) {
  const osmAreaInfo = await fetch(`${OSM_API_URL}/${areaType}/${areaId}.json`);

  if (osmAreaInfo.ok) {
    const osmArea = await osmAreaInfo.json();

    if (osmArea.elements[0]?.tags?.short_name !== undefined) {
      return osmArea.elements[0]?.tags?.short_name;
    }
    return osmArea.elements[0]?.tags?.name;
  }
}

async function fetchOpenProjects() {
  const projects = new OpenProjects();
  const projectDatabaseContract = new web3.eth.Contract(
    DATABASE_CONTRACT.abi,
    DATABASE_CONTRACT_ADRESS
  );
  const openProjects = await projectDatabaseContract.methods
    .getAllActive()
    .call();

  if (openProjects.length !== 0) {
    for (const projectData of openProjects) {
      const projectId = Web3.utils.toNumber(projectData.id);
      const areaType = parseAreaType(projectData.areaType);
      const aredId = Web3.utils.toNumber(projectData.areaId);
      const areaName = await fetchAreaName(areaType, aredId);
      const validKeys = await JSON.parse(projectData.jsonValidKeys);
      const validNodes = await fetchValidNodes(areaType, aredId, validKeys);
      const project = new MappingProject(
        projectId,
        projectData.name,
        projectData.creator,
        areaType,
        aredId,
        areaName,
        validNodes,
        validKeys
      );

      projects.insert(project);
    }
  }

  return projects;
}

async function createProject(
  projectName,
  username,
  areaType,
  areaId,
  validKeys
) {
  let projectCreated = false;
  const projectDatabaseContract = new web3.eth.Contract(
    DATABASE_CONTRACT.abi,
    DATABASE_CONTRACT_ADRESS
  );

  try {
    await metamask.request({ method: 'eth_requestAccounts' });

    if (metamask.selectedAddress !== null) {
      const createContractMethod =
        projectDatabaseContract.methods.createProject(
          projectName,
          username,
          parseAreaType(areaType),
          areaId,
          JSON.stringify(validKeys)
        );
      const gasPrice = await web3.eth.getGasPrice();
      const estimatedGas = await createContractMethod.estimateGas();
      const rawTx = {
        from: metamask.selectedAddress,
        to: DATABASE_CONTRACT_ADRESS,
        gas: estimatedGas * 2n,
        gasPrice: gasPrice,
        data: createContractMethod.encodeABI(),
        chain: ETHEREUM_NETWORK,
      };

      await web3.eth
        .sendTransaction(rawTx)
        .on('transactionHash', (hash) => {
          console.log(`Hash da transação: ${hash}`);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log(confirmationNumber);
        })
        .on('receipt', (receipt) => {
          console.log(receipt);
          projectCreated = receipt !== undefined;
        })
        .on('error', (error, receipt) => {
          console.log(`Erro ao realizar transação: ${error}`);
          console.log(receipt);
        });
    }
  } catch (error) {
    if (error.code === 4001) {
      console.log('Solicitação ao MetaMask não autorizada pelo usuário!');
    } else if (error.code === -32000) {
      console.log(
        `Out of gas: Gas Price ${gasPrice}, Gas Limit ${estimatedGas}`
      );
      console.log(
        `Out of gas: Gas Price ${web3.utils.toWei(
          gasPrice,
          'ether'
        )}, Gas Limit ${web3.utils.toWei(estimatedGas, 'ether')}`
      );
      console.log(receipt);
    }

    console.log(`Erro ao criar projeto (${projectName})`);
    console.log(error);
  }

  return projectCreated;
}

module.exports = {
  checkMetaMaskStatus,
  isChangesetMinted,
  mintChangeset,
  fetchChangesetURI,
  createProject,
  fetchOpenProjects,
};

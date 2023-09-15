require('dotenv').config();
const Web3 = require('web3');
const { createExternalExtensionProvider } = require('@metamask/providers');
const { storeChangesetNFT } = require('./ipfs-utils');
const { MetaMaskStatus } = require('../app/scripts/models/enums');
const NFT_CONTRACT = require('../data/artifacts/contracts/MappingNFT.sol/MappingNFT.json');
const DATABASE_CONTRACT = require('../data/artifacts/contracts/ProjectDatabase.sol/ProjectDatabase.json');
const {
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
        4,
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

module.exports = {
  checkMetaMaskStatus,
  isChangesetMinted,
  mintChangeset,
  fetchChangesetURI,
};

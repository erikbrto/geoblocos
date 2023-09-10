import { MetaMaskStatus } from '../models/enums.js';

export function showUsername(username) {
  const usernameTag = document.getElementById('username');
  usernameTag.innerText = username;
}

export function showMetaMaskStatus(status) {
  const metaMaskStatus = document.getElementById('metamask-status');

  switch (status) {
    case MetaMaskStatus.Connected:
      metaMaskStatus.src = '../../icons/green-circle.png';
      metaMaskStatus.title = 'MetaMask está conectado.';
      break;

    case MetaMaskStatus.Disconnected:
      metaMaskStatus.src = '../../icons/red-circle.png';
      metaMaskStatus.title = 'MetaMask está desconectado.';
      break;

    case MetaMaskStatus.NotInstalled:
      metaMaskStatus.src = '../../icons/gray-circle.png';
      metaMaskStatus.title = 'O MetaMask não está instalado.';
      break;
  }
}

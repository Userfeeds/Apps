import React from 'react';
import Web3 from 'web3';

const web3 = new Web3('');

const setProviderIfAvailable = () => {
  if (typeof window.web3 !== 'undefined') {
    web3.setProvider(window.web3.currentProvider);
  }
};

if (document.readyState === 'complete') {
  setProviderIfAvailable();
} else {
  window.addEventListener('load', setProviderIfAvailable);
}

export default web3;

export type TNetwork = 'ropsten' | 'rinkeby' | 'kovan' | 'ethereum';

const infuraNetworkMapping = new Map<TNetwork, Web3>();

export const getInfura = (network: TNetwork): Web3 => {
  // ToDo fix type
  const key = network as TNetwork;
  if (infuraNetworkMapping.has(key)) {
    return infuraNetworkMapping.get(key)!;
  }
  const networkName = network === 'ethereum' ? 'mainnet' : network;
  const web3 = new Web3(new Web3.providers.HttpProvider(`https://${networkName}.infura.io/DjvHIbnUXoxqu4dPRcbB`));

  infuraNetworkMapping.set(key, web3);

  return web3;
};

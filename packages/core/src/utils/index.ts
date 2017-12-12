const networkMapping = {
  1: 'ethereum',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
};

export async function getBalance(web3Instance): Promise<string> {
  throwIfNotConnected(web3Instance);
  const [account] = await web3Instance.eth.getAccounts();

  if (!account) {
    return '';
  }
  return web3Instance.eth.getBalance(account);
}

export function getBlock(web3Instance, blockNumber): Promise<{ timestamp: number; }> {
  throwIfNotConnected(web3Instance);
  return web3Instance.eth.getBlock(blockNumber);
}

export function getBlockNumber(web3Instance): Promise<number> {
  throwIfNotConnected(web3Instance);
  return web3Instance.eth.getBlockNumber();
}

export async function getCurrentNetworkName(web3Instance): Promise<string> {
  throwIfNotConnected(web3Instance);
  const networkId = await web3Instance.eth.net.getId();

  return networkMapping[networkId];
}

export function getAccounts(web3Instance): Promise<string[]> {
  throwIfNotConnected(web3Instance);
  return web3Instance.eth.getAccounts();
}

export function getTransactionReceipt(web3Instance, transactionId): Promise<string> {
  throwIfNotConnected(web3Instance);
  return web3Instance.eth.getTransactionReceipt(transactionId);
}

async function throwIfNotConnected(web3Instance) {
  if (!await web3Instance.eth.net.isListening()) {
    throw Error('web3 is not connected');
  }
}
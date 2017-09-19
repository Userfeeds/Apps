const withoutValueTransferContractAddressMapping = {
  ethereum: '0xFd74f0ce337fC692B8c124c094c1386A14ec7901',
  rinkeby: '0xC5De286677AC4f371dc791022218b1c13B72DbBd',
  ropsten: '0x6f32a6F579CFEed1FFfDc562231C957ECC894001',
  kovan: '0x139d658eD55b78e783DbE9bD4eb8F2b977b24153'
};

const valueTransferContractAddressMapping = {
  ethereum: '0x70B610F7072E742d4278eC55C02426Dbaaee388C',
  rinkeby: '0x00034B8397d9400117b4298548EAa59267953F8c',
  ropsten: '0x37C1CA7996CDdAaa31e13AA3eEE0C89Ee4f665B5',
  kovan: '0xc666c75C2bBA9AD8Df402138cE32265ac0EC7aaC'
};

const tokenTransferContractAddressMapping = {
  ethereum: '0xfF8A1BA752fE5df494B02D77525EC6Fa76cecb93',
  rinkeby: '0xBd2A0FF74dE98cFDDe4653c610E0E473137534fB',
  ropsten: '0x54b4372fA0bd76664B48625f0e8c899Ff19DFc39',
  kovan: '0xd6Ede7F43882B100C6311a9dF801088eA91cEb64'
};

function getContractWithoutValueTransfer(web3Instance, networkName) {
  let contractAddress = withoutValueTransferContractAddressMapping[networkName];
  if (!contractAddress) {
    throw new Error('Contract is not available');
  }
  let contract = web3Instance.eth.contract(withoutValueTransferAbi).at(contractAddress);
  return contract;
}

const withoutValueTransferAbi = [{
  constant: false,
  inputs: [
    { name: 'data', type: 'string' }
  ],
  name: 'post',
  outputs: [],
  payable: false,
  type: 'function'
}];

function getContractValueTransfer(web3Instance, networkName) {
  let contractAddress = valueTransferContractAddressMapping[networkName];
  if (!contractAddress) {
    throw new Error('Contract is not available');
  }
  let contract = web3Instance.eth.contract(valueTransferAbi).at(contractAddress);
  return contract;
}

const valueTransferAbi = [{
  constant: false,
  inputs: [
    { name: 'userfeed', type: 'address' },
    { name: 'data', type: 'string' }
  ],
  name: 'post',
  outputs: [],
  payable: true,
  type: 'function'
}];

function getContractTokenTransfer(web3Instance, networkName) {
  let contractAddress = tokenTransferContractAddressMapping[networkName];
  if (!contractAddress) {
    throw new Error('Contract is not available');
  }
  let contract = web3Instance.eth.contract(tokenTransferAbi).at(contractAddress);
  return contract;
}

const tokenTransferAbi = [{
  constant: false,
  inputs: [
    { name: 'userfeed', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'string' }
  ],
  name: 'post',
  outputs: [],
  payable: false,
  type: 'function'
}];

module.exports = {
  getContractWithoutValueTransfer,
  getContractValueTransfer,
  getContractTokenTransfer,
};

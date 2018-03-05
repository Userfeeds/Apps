import { extendObservable, computed, action } from 'mobx';
import { networkMapping } from '@userfeeds/core/src/utils';
import { fromWeiToString } from '@linkexchange/utils/balance';
import {
  sendClaimTokenTransfer,
  sendClaimValueTransfer,
  sendClaimWithoutValueTransfer,
  approveUserfeedsContractTokenTransfer,
} from '@userfeeds/core/src/ethereumClaims';
import Web3 from 'web3';
import { BN } from 'web3-utils';
import { TNetwork } from '@linkexchange/utils/web3';
import { PromiEvent, TransactionReceipt } from 'web3/types';

interface IInitialState {
  asset?: string;
  currentProvider?: any;
  isListening?: boolean;
  injectedWeb3ActiveNetwork?: TNetwork;
  decimals?: string;
  balance?: string | undefined;
  allowance?: string | undefined;
}

export default class Web3Store {
  updateInjectedWeb3StateIntervalId: any;
  updateTokenDetailsIntervalId: any;

  currentProvider: any;
  isListening: boolean;
  injectedWeb3ActiveNetwork: TNetwork;
  currentAccount: string;

  asset: string;

  decimals: number;
  symbol: string;
  name: string;
  balance: string;
  allowance: string;

  constructor(
    private injectedWeb3: Web3,
    private Erc20Ctor,
    initialState: IInitialState = {
      asset: '',
      currentProvider: undefined,
      isListening: undefined,
      allowance: undefined,
    },
  ) {
    extendObservable(this, initialState);
    this.startUpdatingInjectedWeb3State();
    this.startUpdatingTokenDetails();
  }

  startUpdatingInjectedWeb3State() {
    this.updateInjectedWeb3State();
    clearInterval(this.updateInjectedWeb3StateIntervalId);
    this.updateInjectedWeb3StateIntervalId = setInterval(this.updateInjectedWeb3State, 1000);
  }

  startUpdatingTokenDetails() {
    this.updateTokenDetails();
    clearInterval(this.updateTokenDetailsIntervalId);
    this.updateTokenDetailsIntervalId = setInterval(this.updateTokenDetails, 1000);
  }

  stopUpdating() {
    clearInterval(this.updateInjectedWeb3StateIntervalId);
    clearInterval(this.updateTokenDetailsIntervalId);
  }

  tokenRequests() {
    if (!this.ready) {
      return [undefined, undefined, undefined, undefined, undefined];
    } else if (this.token) {
      return [
        this.erc20.decimals(),
        this.erc20.symbol(),
        this.erc20.name(),
        this.erc20.balance(),
        this.erc20.allowance(),
      ];
    } else {
      return [18, 'ETH', 'ETH', this.injectedWeb3.eth.getBalance(this.currentAccount), undefined];
    }
  }

  @action
  async changeAssetTo(asset: string) {
    this.asset = asset;
  }

  @action.bound
  async updateTokenDetails() {
    const [decimals, symbol, name, balance, allowance] = await Promise.all(this.tokenRequests());
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    this.balance = balance;
    this.allowance = allowance;
  }

  @action.bound
  async updateInjectedWeb3State() {
    this.currentProvider = this.injectedWeb3.currentProvider;
    if (!this.currentProvider) {
      return;
    }
    const [isListening, networkId, accounts] = await Promise.all([
      this.injectedWeb3.eth.net.isListening(),
      this.injectedWeb3.eth.net.getId(),
      this.injectedWeb3.eth.getAccounts(),
    ]);
    this.isListening = isListening;
    this.injectedWeb3ActiveNetwork = networkMapping[networkId];
    this.currentAccount = accounts[0];
  }

  @computed
  get erc20() {
    return new this.Erc20Ctor(this.network, this.token);
  }

  @computed
  get activeNetwork() {
    return this.ready ? this.injectedWeb3ActiveNetwork : undefined;
  }

  @computed
  get reason() {
    if (!this.currentProvider || !this.isListening) {
      return 'Enable Metamask to unlock all the features';
    } else if (!this.currentAccount) {
      return 'Unlock your wallet to unlock all the features';
    } else if (this.activeNetwork !== this.network) {
      return `Switch to ${this.network} network to unlock all the features`;
    }
  }

  @computed
  get ready() {
    return !!(this.currentProvider && this.isListening);
  }

  @computed
  get network() {
    return this.asset.split(':')[0] as TNetwork;
  }

  @computed
  get token() {
    return this.asset.split(':')[1];
  }

  @computed
  get balanceWithDecimalPoint() {
    return this.balance !== null && this.balance !== undefined
      ? fromWeiToString(this.balance, this.decimals)
      : undefined;
  }

  @computed
  get allowanceWithDecimalPoint() {
    return this.allowance !== null && this.allowance !== undefined
      ? fromWeiToString(this.allowance, this.decimals)
      : undefined;
  }

  sendTokenClaim(recipientAddress, claim, value?) {
    if (value === undefined) {
      return sendClaimWithoutValueTransfer(this.injectedWeb3, claim);
    } else {
      return sendClaimTokenTransfer(this.injectedWeb3, recipientAddress, this.token, value, claim);
    }
  }

  sendEthereumClaim(recipientAddress, claim, value?) {
    if (value === undefined) {
      return sendClaimWithoutValueTransfer(this.injectedWeb3, claim);
    } else {
      return sendClaimValueTransfer(this.injectedWeb3, recipientAddress, value, claim);
    }
  }

  approveEthereum(value) {
    return Promise.resolve({ promiEvent: Promise.resolve() });
  }

  @computed
  get sendClaim(): (
    recipientAddress: string,
    claim: string,
    value?: string,
  ) => Promise<{
    promiEvent: PromiEvent<TransactionReceipt>;
  }> {
    return this.token ? this.sendTokenClaim : this.sendEthereumClaim;
  }

  shouldApprove(value: string) {
    return !!this.token && (new BN(this.allowance).lte(new BN(value)) as boolean);
  }

  approve(value) {
    return approveUserfeedsContractTokenTransfer(this.injectedWeb3, this.token, value);
  }
}
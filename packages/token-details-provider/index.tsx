import React, { Component } from 'react';
import Web3 from 'web3';
import flowRight from 'lodash/flowRight';

import core from '@userfeeds/core/src';
import wait from '@linkexchange/utils/wait';
import { fromWeiToString } from '@linkexchange/utils/balance';
import Web3TaskRunner from '@linkexchange/utils/web3TaskRunner';
import { Omit, Diff } from '@linkexchange/types';
import { withInjectedWeb3, withInfura } from '@linkexchange/utils/web3';

const { erc20ContractDecimals, erc20ContractBalance, erc20ContractSymbol, erc20ContractName } = core.ethereum.erc20;

const { allowanceUserfeedsContractTokenTransfer } = core.ethereum.claims;

interface IProps {
  web3: Web3;
  asset: string;
  loadBalance?: boolean;
  render(tokenDetails: ITokenDetails): any;
}

export interface ITokenDetails {
  decimals: number;
  symbol: string;
  name: string;
  balance: string | null;
  balanceWithDecimalPoint: string | null;
  allowance: string | null;
}

interface IState {
  loaded: boolean;
  tokenDetails?: ITokenDetails;
}

interface IComponentProps {
  tokenDetails: ITokenDetails;
}

interface IAdditionalProps {
  web3: Web3;
  loadBalance?: boolean;
  asset: string;
}

export default class TokenDetailsProvider extends Component<IProps, IState> {
  removeListener: () => void;
  state: IState = {
    loaded: false,
  };

  componentDidMount() {
    this.removeListener = taskRunner.run(
      this.props.web3,
      [this.props.asset, !!this.props.loadBalance],
      (tokenDetails) => {
        this.setState({ loaded: true, tokenDetails });
      },
    );
  }

  componentWillUnmount() {
    this.removeListener();
  }

  render() {
    return this.state.loaded && this.props.render(this.state.tokenDetails!);
  }
}

export const TokenDetailsProviderWithInfura = withInfura(TokenDetailsProvider);
export const TokenDetailsProviderWithInjectedWeb3 = withInjectedWeb3(TokenDetailsProvider);

export const withTokenDetails = <T extends IComponentProps>(Cmp: React.ComponentType<T>) => {
  return class extends Component<Omit<T, keyof IComponentProps> & IAdditionalProps, IState> {
    static displayName = `withTokenDetails(${Cmp.displayName || Cmp.name})`;
    removeListener: () => void;

    state: IState = {
      loaded: false,
    };

    componentDidMount() {
      this.removeListener = taskRunner.run(
        this.props.web3,
        [this.props.asset, !!this.props.loadBalance],
        (tokenDetails) => {
          this.setState({ loaded: true, tokenDetails });
        },
      );
    }

    componentWillUnmount() {
      this.removeListener();
    }

    render() {
      return this.state.loaded ? <Cmp tokenDetails={this.state.tokenDetails!} {...this.props} /> : null;
    }
  };
};

export const withInfuraAndTokenDetails = flowRight(withInfura, withTokenDetails);
export const withInjectedWeb3AndTokenDetails = flowRight(withInjectedWeb3, withTokenDetails);

const loadTokenDetails = async (web3, [asset = '', loadBalance], update) => {
  const [network, token] = asset.split(':');
  if (!token && !loadBalance) {
    return update({ decimals: 18, symbol: 'ETH', name: 'ETH' });
  }

  while (
    !(
      web3.currentProvider !== null &&
      (await web3.eth.net.isListening()) &&
      (await core.utils.getCurrentNetworkName(web3)) === network
    )
  ) {
    await wait(1000);
  }

  if (!token && loadBalance) {
    while (true) {
      const balance = await core.utils.getBalance(web3);
      const balanceWithDecimalPoint = balance !== null ? fromWeiToString(balance, 18) : balance;

      update({ decimals: 18, symbol: 'ETH', name: 'ETH', balance, balanceWithDecimalPoint });
      await wait(1000);
    }
  }

  while (true) {
    const [decimals, symbol, name, balance, allowance] = await Promise.all([
      erc20ContractDecimals(web3, token).then((d) => parseInt(d, 10)),
      erc20ContractSymbol(web3, token),
      erc20ContractName(web3, token),
      loadBalance ? erc20ContractBalance(web3, token) : Promise.resolve(null),
      loadBalance ? allowanceUserfeedsContractTokenTransfer(web3, token) : Promise.resolve(null),
    ]);

    const balanceWithDecimalPoint = balance !== null ? fromWeiToString(balance, decimals) : balance;

    update({
      decimals,
      symbol,
      name,
      balance,
      balanceWithDecimalPoint,
      allowance,
    });

    await wait(1000);
  }
};

const taskRunner = new Web3TaskRunner<ITokenDetails, [string, boolean]>(loadTokenDetails);

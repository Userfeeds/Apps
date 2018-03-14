import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Web3 from 'web3';

import core from '@userfeeds/core/src';
import wait from '@linkexchange/utils/wait';
import Web3Store from '@linkexchange/web3-store';

interface IProps {
  web3Store: Web3Store;
  asset: string;
  startBlock: number;
  endBlock: number;
  render(state: Web3Store): JSX.Element;
}

interface IState {
  loaded: boolean;
  blocksState?: IWeb3State;
}

const HASNT_STARTED = `The auction hasn't begun yet`;
const IS_CLOSED = 'The auction is closed';

@inject('web3Store')
@observer
class BlocksTillConclusionProvider extends Component<IProps, IState> {
  static reasons = {
    HASNT_STARTED,
    IS_CLOSED,
  };

  render() {
    const { web3Store } = this.props;

    if (web3Store.reason) {
      return this.props.render(web3Store);
    }

    return this.props.render(HASNT_STARTED);
  }
}

export default BlocksTillConclusionProvider;

const load = async (web3, [asset, startBlock, endBlock], update) => {
  const [network] = asset.split(':');

  while (
    !(
      web3.currentProvider !== null &&
      (await web3.eth.net.isListening()) &&
      (await core.utils.getCurrentNetworkName(web3)) === network
    )
  ) {
    await wait(1000);
  }

  while (true) {
    const blockNumber = await core.utils.getBlockNumber(web3);

    if (startBlock > blockNumber) {
      update({ enabled: false, reason: HASNT_STARTED });
    } else if (endBlock > blockNumber) {
      update({ enabled: true });
    } else {
      update({ enabled: false, reason: IS_CLOSED });
    }
    await wait(10 * 1000);
  }
};

// const taskRunner = new Web3TaskRunner<{ enabled: boolean; reason?: string }, [string, number, number]>(load);

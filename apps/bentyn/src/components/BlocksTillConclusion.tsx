import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import moment from 'moment';

import core from '@userfeeds/core/src';
import wait from '@linkexchange/utils/wait';
import Web3TaskRunner from '@linkexchange/utils/web3TaskRunner';
import Web3StateProvider from '@linkexchange/web3-state-provider';

import Tooltip from '@linkexchange/components/src/Tooltip';

import { IBentynState } from '../ducks/bentyn';

import ProgressBar from './ProgressBar';

import * as style from './blocksTillConclusion.scss';

const cx = classnames.bind(style);

interface IProps {
  asset: string;
  web3: any;
  className?: string;
  startBlock: number;
  endBlock: number;
}

interface IState {
  average: number;
  loaded: boolean;
  blockNumber?: number;
}

export default class BlocksTillConclusion extends Component<IProps, IState> {
  removeListener: () => void;
  state: IState = {
    average: 12,
    loaded: false,
  };

  componentDidMount() {
    this.removeListener = taskRunner.run(this.props.web3, [this.props.asset], ({ blockNumber, average }) => {
      this.setState({ loaded: true, blockNumber, average });
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  render() {
    return this.state.loaded ? this._renderComponent() : null;
  }

  _renderComponent = () => {
    const { startBlock, endBlock } = this.props;
    const { blockNumber } = this.state;

    let content: JSX.Element | null = null;
    if (startBlock > blockNumber!) {
      content = (
        <>
          <p>Auction will begin at block </p>
          <p>
            <span className={style.blockNumber}>{startBlock} </span>
            (est. {this._getEstimate(startBlock - blockNumber!)})
          </p>
        </>
      );
    } else if (endBlock > blockNumber!) {
      const progress = ((blockNumber! - startBlock) / (endBlock - startBlock) * 100).toFixed(2);
      content = (
        <>
          <p>Blocks till conclusion</p>
          <p>
            <span className={style.blockNumber}>{endBlock - blockNumber!} </span>
            (est. {this._getEstimate(endBlock - blockNumber!)})
          </p>
          <Tooltip text={`${progress}%`}>
            <ProgressBar progress={progress} className={style.progressBar} />
          </Tooltip>
        </>
      );
    } else {
      content = (
        <p>Auction is closed</p>
      );
    }

    return (
      <div className={cx(style.self, this.props.className)}>
        {content}
      </div>
    );
  }

  _getEstimate = (blocks) => {
    return moment.duration(blocks * this.state.average * 1000).humanize();
  }
}

const load = async (web3, [asset], update) => {
  const [network] = asset.split(':');

  while (!(await web3.eth.net.isListening() || await core.utils.getCurrentNetworkName(web3) === network)) {
    wait(1000);
  }

  while (true) {
    const blockNumber = await core.utils.getBlockNumber(web3);
    const average = await getAverageBlockTime(web3, blockNumber);
    update({ blockNumber, average });
    await wait(average * 1000);
  }
};

const getAverageBlockTime = async (web3, blockNumber): Promise<number> => {
  const SPAN = 100;
  const currentBlock = await core.utils.getBlock(web3, blockNumber);
  const pastBlock = await core.utils.getBlock(web3, blockNumber - SPAN);

  const average = (currentBlock.timestamp - pastBlock.timestamp) / 100;

  return average;
};

const taskRunner = new Web3TaskRunner<
  { blockNumber: number; average: number },
  [string]
>(load);

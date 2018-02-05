import React, { Component, ChangeEvent } from 'react';
import classnames from 'classnames/bind';
import BigNumber from 'bignumber.js';

import Icon from '@linkexchange/components/src/Icon';
import { IRemoteLink, ILink } from '@linkexchange/types/link';
import { R, validate } from '@linkexchange/utils/validation';
import { ITokenDetails } from '@linkexchange/token-details-provider';
import { fromWeiToString, toWei } from '@linkexchange/utils/balance';
import MetaFox from '@linkexchange/images/metafox_straight.png';

import Header from './Header';
import Slider from './Slider';

import * as style from './booster.scss';
const cx = classnames.bind(style);

interface IProps {
  link: IRemoteLink | ILink;
  linksInSlots: IRemoteLink[];
  tokenDetails: ITokenDetails;
  onSend(toPay: string): void;
}

interface IState {
  isInSlots: boolean;
  sum: BigNumber;
  toPay: string;
  inputError?: string;
  positionInSlots: number | null;
  hasInsufficientFunds: boolean;
  probability: number | null;
}

export default class Booster extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const positionInRanking = this.props.linksInSlots.findIndex((l) => l.id === this.props.link.id);
    this.state = {
      isInSlots: positionInRanking >= 0,
      toPay: '0',
      positionInSlots: positionInRanking >= 0 ? positionInRanking : null,
      hasInsufficientFunds: false,
      sum: this.props.linksInSlots.reduce((acc, { score }) => acc.add(score.toFixed(0)), new BigNumber(0)),
      probability: null,
    };
  }

  componentWillMount() {
    if (this._isILink(this.props.link) && this.props.link.probability + 1 <= 100) {
      this._onSliderChange(this.props.link.probability + 1);
    }
  }

  render() {
    const { tokenDetails, link } = this.props;
    const { isInSlots, inputError, toPay, probability, positionInSlots, hasInsufficientFunds } = this.state;
    const disabled = this._isDisabled();

    return (
      <>
        <Header positionInSlots={positionInSlots} tokenDetails={tokenDetails} />
        {isInSlots && (
          <>
            <div className={style.probability}>
              Probability:
              <span className={cx(style.value, { disabled })}>
                {probability === null ? '-' : probability.toFixed(1)}
              </span>
            </div>
            <Slider
              className={style.slider}
              initialValue={this._getLinkProbability()}
              value={probability}
              onChange={this._onSliderChange}
            />
          </>
        )}
        {!isInSlots &&
          positionInSlots === null && (
            <div className={style.toAdd} onClick={this._boostToBeInSlots}>
              <p>
                This link needs{' '}
                <span className={style.value}>
                  {this._toAddToBeInSlots(3)} {tokenDetails.symbol}
                </span>{' '}
              </p>
              <p>to be in slots.</p>
            </div>
          )}
        {!isInSlots &&
          positionInSlots !== null && (
            <div className={style.probability}>
              Probability:
              <span className={cx(style.value, { disabled })}>
                {probability === null ? '-' : probability.toFixed(1)}
              </span>
            </div>
          )}
        <div className={cx(style.footer, { hasInsufficientFunds, error: !!inputError })}>
          <div className={style.inputButtonContainer}>
            <input type="text" className={style.toPay} value={toPay} onChange={this._onInputChange} />
            <div className={cx(style.next, { disabled })} onClick={this._onSendClick}>
              {!disabled ? <img src={MetaFox} className={style.fox} /> : <Icon name="x" className={style.icon} />}
            </div>
          </div>
          <span className={style.error}>{hasInsufficientFunds ? 'Insufficient Funds' : inputError}</span>
        </div>
      </>
    );
  }

  _isZero = (amount) => {
    return new BigNumber(amount).isZero();
  };

  _boostToBeInSlots = () => {
    const toAdd = this._toAddToBeInSlots();
    const { toPay } = this.state;

    const totalToPay = new BigNumber(toPay).add(toAdd).toString(10);
    this._onInputChange({ target: { value: totalToPay } } as ChangeEvent<HTMLInputElement>); // ToDo make it better
  };

  _toAddToBeInSlots = (decimals?: number) => {
    const { link, linksInSlots, tokenDetails } = this.props;
    const { toPay } = this.state;
    const lastLinkInSlots = linksInSlots[linksInSlots.length - 1];

    const toAdd = new BigNumber(lastLinkInSlots.score.toFixed(0))
      .minus(new BigNumber(link.score.toFixed(0)).add(toWei(toPay, tokenDetails.decimals)))
      .add(1)
      .toString();

    return fromWeiToString(toAdd, tokenDetails.decimals, decimals || tokenDetails.decimals);
  };

  _onSendClick = () => {
    const { inputError, hasInsufficientFunds } = this.state;
    if (!!inputError || hasInsufficientFunds) {
      return;
    }

    this.props.onSend(this.state.toPay);
  };

  _onSliderChange = (newProbability: number) => {
    const { link, linksInSlots, tokenDetails } = this.props;
    const { sum } = this.state;

    if (this._isILink(link) && newProbability === link.probability) {
      this.setState({ probability: newProbability, toPay: '0' });
      return;
    }

    let toPayWei;
    toPayWei = new BigNumber(100)
      .mul(link.score.toFixed(0))
      .sub(sum.mul(newProbability))
      .div((newProbability - 100).toFixed(1))
      .truncated();
    if (toPayWei.lt(0)) {
      toPayWei = new BigNumber(0);
    }

    const toPay = fromWeiToString(
      toPayWei.toString(),
      tokenDetails.decimals,
      tokenDetails.decimals < 4 ? tokenDetails.decimals : 4,
    );
    const positionInSlots = this._getLinkPosition(toPayWei, link, linksInSlots);

    if (toPayWei.gt(this.props.tokenDetails.balance!)) {
      this.setState({
        toPay,
        positionInSlots,
        probability: newProbability,
        hasInsufficientFunds: true,
        inputError: undefined,
      });
    } else {
      this.setState({
        toPay,
        positionInSlots,
        probability: newProbability,
        hasInsufficientFunds: false,
        inputError: undefined,
      });
    }
  };

  _onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputError = this._validateInputValue(e.target.value);
    if (inputError) {
      this.setState({ inputError, toPay: e.target.value });
      return;
    }
    const { link, linksInSlots, tokenDetails } = this.props;
    const { sum, isInSlots } = this.state;

    const toPay = e.target.value;
    const toPayWei = new BigNumber(toWei(toPay, tokenDetails.decimals));
    const linkTotalScore = toPayWei.add(link.score.toFixed(0));

    let positionInSlots;
    if (isInSlots) {
      const probability = linkTotalScore
        .div(sum.add(toPayWei))
        .mul(1000)
        .round()
        .div(10)
        .toNumber();
      positionInSlots = this._getLinkPosition(linkTotalScore, link, linksInSlots);

      this.setState({ probability });
    } else {
      const lastLinkInSlots = linksInSlots[linksInSlots.length - 1];
      if (linkTotalScore.gt(lastLinkInSlots.score.toFixed(0))) {
        const newLinksInSlots = linksInSlots
          .map((l) => new BigNumber(l.score.toFixed(0)))
          .concat([linkTotalScore])
          .sort((a, b) => b.comparedTo(a))
          .slice(0, linksInSlots.length);

        positionInSlots = newLinksInSlots.indexOf(linkTotalScore);

        const probability = linkTotalScore
          .div(newLinksInSlots.reduce((acc, score) => score.add(acc), new BigNumber(0)))
          .mul(1000)
          .round()
          .div(10)
          .toNumber();

        this.setState({ probability });
      } else {
        positionInSlots = null;
      }
    }

    if (toPayWei.gt(this.props.tokenDetails.balance!)) {
      this.setState({ toPay, positionInSlots, hasInsufficientFunds: true, inputError: '' });
    } else {
      this.setState({ toPay, positionInSlots, hasInsufficientFunds: false, inputError: '' });
    }
  };

  _getLinkPosition = (linkTotalScore: BigNumber, link: IRemoteLink, links: IRemoteLink[]) => {
    const positionInSlots = links
      .map((l) => (l === link ? linkTotalScore : new BigNumber(l.score.toFixed(0))))
      .sort((a, b) => b.comparedTo(a))
      .indexOf(linkTotalScore);

    return positionInSlots >= 0 ? positionInSlots : null;
  };

  _validateInputValue = (value: string) => {
    const rules = [
      R.number,
      R.value((v: number) => v >= 0, 'Cannot be negative'),
      R.value((v: string) => {
        const dotIndex = v.indexOf('.');
        if (dotIndex !== -1) {
          return v.length - 1 - dotIndex <= this.props.tokenDetails.decimals;
        }
        return true;
      }, 'Invalid value'),
    ];

    return validate(rules, value);
  };

  _isDisabled = () => {
    const { inputError, hasInsufficientFunds, toPay } = this.state;
    return !!inputError || hasInsufficientFunds || this._isZero(toPay);
  };

  _getLinkProbability = (): number => {
    const { link } = this.props;
    return (link as ILink).probability;
  };

  _isILink = (link: ILink | IRemoteLink): link is ILink => {
    return (link as ILink).probability !== undefined;
  };
}

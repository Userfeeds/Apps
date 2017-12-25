import React from 'react';
import classnames from 'classnames/bind';

import MetaFox from '@linkechange/transaction-provider/metafox.png';

import * as style './footon.scss';
const cx = classnames.bind(style);

interface IProps {
  type: 'confirm' | 'metamask';
}

const Footton = ({ type, ...restProps }: IProps) => (
  <div className={cx(style.self, { [type]: true })} {...restProps}>
    {type === 'confirm' ? 'Confirm' : (
      <>
        <img src={MetaFox} style={{ height: '2em' }} />
        Metamask...
      </>
    )}
  </div>
);

export default Footton;
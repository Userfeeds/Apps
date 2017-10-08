import React from 'react';

import Icon from '@userfeeds/apps-components/src/Icon';

import * as style from './backButton.scss';

const BackButton = (props) => (
  <div className={style.self} {...props}>
    <Icon name="arrow-left"/> Widget details
  </div>
);

export default BackButton;

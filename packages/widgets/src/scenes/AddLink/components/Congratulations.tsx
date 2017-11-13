import React from 'react';

import Button from '@userfeeds/apps-components/src/NewButton';
import TextWithLabel from '@userfeeds/apps-components/src/TextWithLabel';

import { openLinkexchangeUrl } from '../../../utils/openLinkexchangeUrl';

import * as style from './congratulations.scss';

const heartSvg = require('../../../images/heart.svg');

const Congratulations = ({ linkId, widgetSettings }) => {
  const goToLinkStatus = () => openLinkexchangeUrl('apps/#/status/', { linkId, ...widgetSettings });

  return (
    <div className={style.self}>
      <img src={heartSvg} />
      <h2>Congratulations!</h2>
      <p>Thanks you for sending the link</p>
      <TextWithLabel label="Contact method" text={widgetSettings.contactMethod} />
      <Button color="primary" onClick={goToLinkStatus}>
        Link Status
      </Button>
    </div>
  );
};

export default Congratulations;

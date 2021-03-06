import { render } from 'react-dom';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'mobx-react';
import qs from 'qs';
import Raven from 'raven-js';
import ReactGA from 'react-ga';

import { IWidgetSettings } from '@linkexchange/types/widget';
import web3 from '@linkexchange/utils/web3';
import { WidgetSettings } from '@linkexchange/widget-settings';

import BlocksStore from './stores/blocks';
import LinksStore from '@linkexchange/links-store';
import App from './App';

import '../styles/all.scss';
import Web3Store from '@linkexchange/web3-store';
import Erc20 from '@linkexchange/web3-store/erc20';

const [, searchParams] = document.location.href.split('?');
const { startBlock, endBlock, ...widgetSettingsFromParams } = qs.parse(searchParams);

const DEFAULT_WIDGET_SETTINGS = {
  apiUrl: 'https://api.userfeeds.io',
  title: 'Title',
  description: 'Description',
  slots: 5,
  timeslot: 60,
  location: window.location.href,
  algorithm: 'links',
  whitelist: '',
  asset: 'ethereum',
};

const widgetSettings: IWidgetSettings = { ...DEFAULT_WIDGET_SETTINGS, ...widgetSettingsFromParams };
const blocksStore = new BlocksStore(parseInt(startBlock, 10), parseInt(endBlock, 10));

const web3Store = new Web3Store(web3, Erc20, widgetSettings);
const widgetSettingsStore = new WidgetSettings(widgetSettings);
const linksStore = new LinksStore(widgetSettingsStore);

const startApp = () => {
  render(
    <Provider
      blocks={blocksStore}
      links={linksStore}
      widgetSettingsStore={widgetSettingsStore}
      web3Store={web3Store}
      formValidationsStore={{ 'add-link': {} }}
    >
      <IntlProvider locale="en">
        <App />
      </IntlProvider>
    </Provider>,
    document.querySelector('.root'),
  );
};

if (process.env.NODE_ENV !== 'development') {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.initialize('UA-113862523-1');
    ReactGA.pageview(window.location.pathname + window.location.search);
  }

  Raven.config('https://cf4174a2d1fb46dabc18269811d5b791@sentry.io/285390', {
    release: `${VERSION}-${process.env.NODE_ENV}`,
  }).install();
  Raven.context(() => startApp());
} else {
  startApp();
}

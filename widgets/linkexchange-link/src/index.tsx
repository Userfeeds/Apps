import '@webcomponents/custom-elements';

import { render } from 'react-dom';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { EWidgetSize } from '@linkexchange/types/widget';

import Banner from './Banner';

import * as style from './styles/all.scss';

class LinkexchangeLink extends HTMLElement {
  static version = VERSION;
  static get observedAttributes() {
    return [
      'api-url',
      'size',
      'timeslot',
      'recipient-address',
      'whitelist',
      'asset',
      'slots',
      'algorithm',
      'contact-method',
      'title',
      'description',
      'impression',
      'till-date',
      'translations',
      'translations-url',
      'open-details',
    ];
  }

  validations = {
    'add-link': {},
  };

  addValidation(
    formName: string,
    inputName: string = 'form',
    callback: (fieldName: string, value: any) => Promise<string | null> | string | null,
  ) {
    if (!this.validations[formName]) {
      this.validations[formName] = {};
    }
    if (!this.validations[formName][inputName]) {
      this.validations[formName][inputName] = [];
    }
    this.validations[formName][inputName].push(callback);
  }

  removeValidation(
    formName: string,
    inputName: string = 'form',
    callback: (fieldName: string, value: any) => Promise<string | null> | string | null,
  ) {
    const validationIndex = this.validations[formName][inputName].indexOf(callback);
    this.validations[formName][inputName].splice(validationIndex, 1);
  }

  translationsFeatchingState: 'none' | 'started' | 'fetched' = 'none';
  connected = false;
  customMessages = {};

  connectedCallback() {
    this.connected = true;
    this.innerHTML = `<div class="${style.root}"></div>`;

    if (this.translationsFeatchingState === 'none' || this.translationsFeatchingState === 'fetched') {
      this.render();
    }
  }

  disconnectedCallback() {
    this.connected = false;
  }

  attributeChangedCallback(attr, _oldValue, newValue) {
    if (attr === 'translations-url') {
      this.fetchTranslations(newValue);
    } else if (attr === 'translations') {
      this.setTranslationsFromWindow(newValue);
    }

    this.render();
  }

  private render() {
    if (!this.connected) {
      return;
    }

    render(
      <IntlProvider locale="en" messages={{ ...this.customMessages }}>
        <Banner widgetSettings={this.argsToState()} root={this} openDetails={this.getOpenMethod()} />
      </IntlProvider>,
      this.querySelector(`.${style.root}`),
    );
  }

  private argsToState() {
    const apiUrl = this.getAttribute('api-url') || 'https://api.userfeeds.io';
    const size = this.getAttribute('size') === 'rectangle' ? EWidgetSize.rectangle : EWidgetSize.leaderboard;
    const timeslot = parseInt(this.getAttribute('timeslot') || '5', 10);
    const recipientAddress = this.getAttribute('recipient-address') || this.throwErrorRecipientAddressNotDefined();
    const whitelist = this.getAttribute('whitelist') || undefined;
    const asset = this.getAttribute('asset') || 'ropsten';
    const slots = parseInt(this.getAttribute('slots') || '10', 10);
    const algorithm = this.getAttribute('algorithm') || 'links';
    const contactMethod = this.getAttribute('contact-method') || undefined;
    const title = this.getAttribute('widget-title') || undefined;
    const description = this.getAttribute('description') || undefined;
    const impression = this.getAttribute('impression') || undefined;
    const tillDate = this.getAttribute('till-date') || undefined;

    return {
      apiUrl,
      algorithm,
      recipientAddress: recipientAddress.toLowerCase(),
      asset: asset.toLowerCase(),
      contactMethod,
      size,
      timeslot,
      whitelist: whitelist ? whitelist.toLowerCase() : whitelist,
      slots,
      title,
      description,
      impression,
      tillDate,
      location: window.location.href,
    };
  }

  private getOpenMethod(): 'modal' | 'tab' {
    const attr = this.getAttribute('open-details');
    if (attr === 'tab') {
      return 'tab';
    }
    return 'modal';
  }

  private async fetchTranslations(url: string) {
    this.translationsFeatchingState = 'started';
    try {
      this.customMessages = await fetch(url).then((res) => res.json());
    } catch (e) {
      console.info('Something went wrong when fetching translations file', e);
    }
    this.translationsFeatchingState = 'fetched';

    this.render();
  }

  private setTranslationsFromWindow(key: string) {
    if (typeof window[key] === 'object') {
      this.customMessages = window[key];
    }
  }

  private throwErrorRecipientAddressNotDefined(): never {
    throw new Error('recipient-address not defined.');
  }
}

const registerElement = () => {
  if (!window.customElements.get('linkexchange-link')) {
    try {
      window.customElements.define('linkexchange-link', LinkexchangeLink);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.info('Error occured when defining custom element', e);
      }
    }
  }
};

if (!window.Intl) {
  import('intl')
    .then(() => import('intl/locale-data/jsonp/en'))
    .then(() => registerElement());
} else {
  registerElement();
}

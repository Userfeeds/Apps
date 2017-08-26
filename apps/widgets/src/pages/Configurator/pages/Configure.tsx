import { h, Component } from 'preact';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import Icon from '@userfeeds/apps-components/src/Icon';
import Label from '@userfeeds/apps-components/src/Label';
import Dropdown from '@userfeeds/apps-components/src/Dropdown';
import RadioButtonGroup from '@userfeeds/apps-components/src/RadioButtonGroup';

import Section from '../components/Section';
import CreateWidget from '../components/CreateWidget';

import Title from '../components/sections/Title';
import Contact from '../components/sections/Contact';
import Description from '../components/sections/Description';
import Size, { WIDGET_SIZES } from '../components/sections/Size';
import Type, { WIDGET_TYPES } from '../components/sections/Type';
import Token, { WIDGET_TOKENS } from '../components/sections/Token';
import Address, { WIDGET_NETWORKS } from '../components/sections/Address';
import Algorithm, { WIDGET_ALGORITHM } from '../components/sections/Algorithm';
import Impression, { WIDGET_IMPRESSIONS } from '../components/sections/Impression';

import * as style from './configure.scss';

interface IWidgetSettings {
  userfeedsId: string;
  whitelistId: string;
  contactMethod: string;
  title: string;
  description: string;
  publisherNote: string;
  impression: string;
  size: string;
  type: string;
  token: string;
  network: string;
  algorithm: string;
}

interface IConfiguratorProps {
  location: any;
}

interface IConfiguratorState {
  widgetSettings: IWidgetSettings;
}

const defaultWidgetSettings = {
  publisherNote: '',
  title: '',
  description: 'I accept only links that are about science and technology. I like trains',
  contactMethod: '',
  size: WIDGET_SIZES[0].value,
  type: WIDGET_TYPES[0].value,
  impression: WIDGET_IMPRESSIONS[0].value,
  token: WIDGET_TOKENS[0].value,
  network: WIDGET_NETWORKS[0].value,
  algorithm: WIDGET_ALGORITHM[0].value,
};

export default class Configurator extends Component<IConfiguratorProps, IConfiguratorState> {

  constructor(props) {
    super(props);

    const web3 = window.web3;
    const userfeedsId = web3 && web3.eth.accounts.length > 0 ? web3.eth.accounts[0] : '';

    if (props.location.search) {
      const params = new URLSearchParams(props.location.search);
      const widgetSettings: any = Array.from(params.entries()).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
      this.state = { widgetSettings };
    } else {
      this.state = {
        widgetSettings: {
          ...defaultWidgetSettings,
          userfeedsId,
          whitelistId: userfeedsId,
        },
      };
    }
  }

  render() {
    return (
      <div>
        <Address
          network={this.state.widgetSettings.network}
          onNetworkChange={this._onNetworkChange}
          address={this.state.widgetSettings.userfeedsId}
          onAddressChange={this._onUserfeedIdChange}
        />
        <Title
          value={this.state.widgetSettings.title}
          onChange={this._onTitleChange}
        />
        <Description
          value={this.state.widgetSettings.description}
          onChange={this._onDescriptionChange}
        />
        <Impression
          value={this.state.widgetSettings.impression}
          onChange={this._onWidgetImpressionChange}
        />
        <Contact
          value={this.state.widgetSettings.contactMethod}
          onChange={this._onContactMethodChange}
        />
        <Size
          value={this.state.widgetSettings.size}
          onChange={this._onWidgetSizeChange}
        />
        <Type
          value={this.state.widgetSettings.type}
          onChange={this._onWidgetTypeChange}
        />
        <Token
          value={WIDGET_TOKENS[0].value}
          onChange={this._noop}
        />
        <Algorithm
          value={WIDGET_ALGORITHM[0].value}
          onChange={this._noop}
        />
        <CreateWidget widgetSettings={this.state.widgetSettings} />
      </div>
    );
  }

  _onNetworkChange = ({ value }) => {
    this.setState(({ widgetSettings }) => ({
      widgetSettings: {
        ...widgetSettings,
        network: value,
      },
    }));
  }

  _handleChange = (name) => (e) => {
    const value = e.target.value;

    this.setState(({ widgetSettings }) => ({
      widgetSettings: {
        ...widgetSettings,
        [name]: value,
      },
    }));
  }

  _noop = () => null;

  _onWidgetTypeChange = this._handleChange('type');
  _onWidgetSizeChange = this._handleChange('size');
  _onUserfeedIdChange = this._handleChange('userfeedsId');
  _onWhitelistIdChange = this._handleChange('whitelistId');
  _onPublisherNoteChange = this._handleChange('publisherNote');
  _onWidgetImpressionChange = this._handleChange('impression');
  _onDescriptionChange = this._handleChange('description');
  _onContactMethodChange = this._handleChange('contactMethod');
  _onTitleChange = this._handleChange('title');
}

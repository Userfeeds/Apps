import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import { fetchLinks } from '@linkexchange/widgets/src/ducks/links';
import { observeInjectedWeb3 } from '@linkexchange/widgets/src/ducks/web3';

import WidgetDetails from '@linkexchange/widgets/src/scenes/WidgetDetails';
import RootModal from '@linkexchange/widgets/src/scenes/Banner/containers/RootModal'; // Extract it

import * as style from './details.scss';

const mapDispatchToProps = (dispatch) => ({
  fetchLinks: () => dispatch(fetchLinks()),
  observeInjectedWeb3: () => dispatch(observeInjectedWeb3()),
});

@connect(null, mapDispatchToProps)
export default class Details extends Component<void, void> {

  componentDidMount() {
    this.props.fetchLinks();
    this.props.observeInjectedWeb3();
  }

  render() {
    return (
      <div class={style.self}>
        <WidgetDetails class={style.details} />
        <RootModal />
      </div>
    );
  }
}

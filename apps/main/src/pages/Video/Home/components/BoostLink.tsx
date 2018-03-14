import React from 'react';
import { inject, observer } from 'mobx-react';

import BoostLinkComponent from '@linkexchange/boost-link';
import { WidgetSettings } from '@linkexchange/widget-settings';
// import { IDefaultBoostLinkWrapperProps } from '@linkexchange/new-details';
import { withTokenDetails } from '@linkexchange/token-details-provider';
import BlocksTillConclusionProvider from '@linkexchange/blocks-till-conclusion-provider';

import BlocksStore from '../../../../stores/blocks';

// const DecoratedBoostLink = withInjectedWeb3(withTokenDetails(withWidgetSettings(BoostLinkComponent)));

interface IProps {
  blocks: BlocksStore;
}

const BoostLink = (props: IProps) => {
  const { blocks, ...restProps } = props;

  return null;
  // return (
  //   <BlocksTillConclusionProvider
  //     startBlock={blocks.startBlock}
  //     endBlock={blocks.endBlock}
  //     asset={props.asset}
  //     render={({ enabled, reason }) => (
  //       <DecoratedBoostLink {...restProps} loadBalance disabled={!enabled} disabledReason={reason} />
  //     )}
  //   />
  // );
};

export default inject('blocks')(observer(BoostLink));

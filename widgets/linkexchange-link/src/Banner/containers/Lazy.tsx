import React from 'react';
import Loadable from 'react-loadable';

import IframePortal from './IframePortal';

import * as style from './lazy.scss';

const Loading = (props) => {
  if (props.pastDelay) {
    return <div>Loading...</div>;
  }
  return null;
};

export const Provider = Loadable({
  loader: () => import('../containers/Provider'),
  loading: Loading,
});

export const Intercom = Loadable({
  loader: () => import('@linkexchange/components/src/Intercom'),
  loading: Loading,
});

export const WidgetDatails = Loadable({
  loader: () => import('@linkexchange/new-details'),
  loading: Loading,
  render: ({ Details, Header, Lists, AddLinkButton }, props) => {
    const { onAddLink, ...restProps } = props;
    return (
      <IframePortal className={style.details}>
        <div className={style.detailsComponent}>
          <Details {...restProps}>
            <Header addLink={<AddLinkButton onClick={onAddLink} />} />
            <Lists />
          </Details>
        </div>
      </IframePortal>
    );
  },
});

export const AddLink = Loadable({
  loader: () => import('@linkexchange/add-link'),
  loading: Loading,
  render: ({ AddLinkWithInjectedWeb3AndTokenDetails }, props) => {
    return (
      <IframePortal className={style.addLink}>
        <AddLinkWithInjectedWeb3AndTokenDetails className={style.addLinkComponent} {...props} />
      </IframePortal>
    );
  },
});

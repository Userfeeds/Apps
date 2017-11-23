import React from 'react';
import Loadable from 'react-loadable';

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

export const WidgetDatails = Loadable({
  loader: () => import('@linkexchange/details/newIndex'),
  loading: Loading,
  render: ({ Details, Header, SideMenu, List}, props) => {
    return (
      <Details {...props}>
        <Header />
        <SideMenu />
        <List />
      </Details>
    );
  },
});

export const AddLink = Loadable({
  loader: () => import('@linkexchange/add-link'),
  loading: Loading,
});

import React from 'react';

export const Details: React.SFC<{ className?: string }> = ({ className, children }) => (
  <div className={className}>{children}</div>
);
export { default as AddLinkButton } from './containers/AddLinkButton';
export { default as Expires } from './components/Expires';
export { default as Header } from './components/Header';
export { default as Lists } from './containers/Lists';

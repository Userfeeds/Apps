import React from 'react';
import classnames from 'classnames';
import 'open-iconic/font/css/open-iconic.min.css';

import * as style from './icon.scss';

type TIconProps = React.HTMLAttributes<HTMLSpanElement> & {
  name: string;
  type?: string;
};

const Icon: React.StatelessComponent<TIconProps> = ({ name, className, ...restProps }) => (
  <span
    className={classnames(style.self, className, 'oi')}
    data-glyph={name}
    aria-hidden="true"
    {...restProps}
  />
);

Icon.defaultProps = { type: 'Icon' };

export default Icon;

import { h } from 'preact';
import * as classnames from 'classnames';
import 'open-iconic/font/css/open-iconic.min.css';

import * as style from './icon.scss';

interface IIconProps {
  name: string;
  class?: string;
}

const Icon = ({ name, class: className, ...restProps }: IIconProps & JSX.HTMLAttributes) => (
  <span class={classnames(className, 'oi')} data-glyph={name} title={name} aria-hidden="true" {...restProps} />
);

export default Icon;

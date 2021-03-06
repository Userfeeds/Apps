import React from 'react';
import * as styles from './pill.scss';
import classnames from 'classnames';

const Pill = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) =>
  props.children ? <span className={classnames(styles.Pill, className)} {...props} /> : null;

export default Pill;

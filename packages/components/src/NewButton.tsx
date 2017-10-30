import React from 'react';
import { isType } from '@userfeeds/utils/src/index';
import * as style from './newButton.scss';
import classnames from 'classnames';

type TButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium';
  color?: 'primary' | 'success' | 'pending' | 'metaPending' | 'error' | 'empty';
  outline?: boolean;
};

const Button = ({ children, className, outline, size = 'medium', color = 'empty', ...props }: TButtonProps) => {
  let icon;
  const decoratedChildren = React.Children.map(children, (child) => {
    if (isType(child, 'Icon')) {
      icon = React.cloneElement(child, { displayName: undefined, className: style.ButtonIcon });
      return null;
    } else {
      return child;
    }
  });
  return (
    <button
      className={classnames(style.Button, className, style[size], style[color], {
        [style.outline]: outline,
      })}
      {...props}
    >
      <div className={style.ButtonInnerWrapper}>
        {icon}
        <div className={style.Children}>{decoratedChildren}</div>
      </div>
    </button>
  );
};

export default Button;

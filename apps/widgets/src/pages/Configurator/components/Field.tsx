import React from 'react';
import classnames from 'classnames';
import BoldText from '@userfeeds/apps-components/src/BoldText';
import * as styles from './field.scss';

export const Field = (props) => <div {...props} className={styles.Field} />;

export const Title = ({ children }) => <BoldText className={styles.Header}>{children}</BoldText>;

export const Description = ({ children }) => <p className={styles.Description}>{children}</p>;

export const Error = ({ children }) => <p className={styles.Error}>{children}</p>;

export const RadioGroup = ({ children, radioWidth, onChange, value, name }) => (
  <div className={styles.inputGroup}>
    {React.Children.map(children, (radio) =>
      React.cloneElement(radio, {
        className: styles.Input,
        style: { width: radioWidth },
        onChange,
        checked: value === radio.props.value,
      }),
    )}
  </div>
);

export default Field;
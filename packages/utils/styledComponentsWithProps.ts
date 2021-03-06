import React from 'react';
import { StyledFunction } from 'styled-components';

export default function styledComponentWithProps<T, U extends HTMLElement = HTMLElement>(
  styledFunction: StyledFunction<React.HTMLProps<U>>,
): StyledFunction<T & React.HTMLProps<U>> {
  return styledFunction;
}

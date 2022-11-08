import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import { withState } from '^/utilities/storybook-state.story';
import { DoubleSlider, Props } from '.';

// eslint-disable-next-line no-magic-numbers
const DEFAULT_VALUES: Props['values'] = [0.75, 1];

const Wrapper = styled.div({
  margin: '20px',
  width: '200px',
});

storiesOf('Atoms|DoubleSlider', module).add('default', withState({
  values: DEFAULT_VALUES,
})(({
  state,
  setState,
}) => {
  const props: Props = {
    values: state.values,
    min: 0.5,
    max: 1,
    gap: 0.01,
    onChange: (values) => {
      action('onChange')(values);
      setState({ values });
    },
  };

  return (
    <Wrapper>
      <DoubleSlider {...props} />
    </Wrapper>
  );
}));

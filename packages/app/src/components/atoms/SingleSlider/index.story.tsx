import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React, { Fragment } from 'react';
import styled from 'styled-components';

import { withState } from '^/utilities/storybook-state.story';

import SingleSlider, { Props } from '.';

const Wrapper = styled.div({
  margin: '20px',
});

storiesOf('Atoms|SingleSlider', module)
  .add('default', withState({ value: 0 })(({
    state,
    setState,
  }) => {
    const props: Props = {
      value: state.value,
      minValue: 0,
      maxValue: 100,
      onChange: (value) => {
        action('onChange')(value);
        setState({ value });
      },
    };

    return (
      <Fragment>
        <Wrapper>
          <SingleSlider {...props} />
        </Wrapper>
      </Fragment>
    );
  }));

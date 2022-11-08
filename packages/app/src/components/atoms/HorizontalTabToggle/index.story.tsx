import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import LengthSVG from '^/assets/icons/elevation-profile/length-tool.svg';
import { withState } from '^/utilities/storybook-state.story';

import HorizontalTabToggle, { Props } from '.';

storiesOf('Atoms|HorizontalTabToggle', module)
  .add('default', withState({ value: false })(({
    state,
    setState,
  }) => {
    const props: Props = {
      isOpened: state.value,
      title: 'Title',
      icon: <LengthSVG />,
      onClick: () => {
        action('onClick');
        setState((prevState) => ({ value: !prevState.value }));
      },
    };

    return (
      <HorizontalTabToggle {...props} />
    );
  }));

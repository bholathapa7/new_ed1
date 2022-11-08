import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MockStore } from 'redux-mock-store';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import { multipleContents } from '^/store/Mock';
import * as T from '^/types';
import { ContentsListVolumeItem, Props } from './';

storiesOf('Molecules|ContentsListVolumeItem', module)
  .add('vc', () => {
    const props: Props = {
      content: multipleContents.filter((content) =>
        content.type === T.ContentType.VOLUME && content.info.calculatedVolume.calculation.type === T.VolumeCalcMethod.BASIC,
      )[0] as T.VolumeContent,
    };
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(props.content);

    return (
      <Provider store={store}>
        <ContentsListVolumeItem {...props} />
      </Provider>
    );
  })
  .add('dbvc-violated', () => {
    const props: Props = {
      content: multipleContents
        .filter((content) =>
          content.type === T.ContentType.VOLUME && content.info.calculatedVolume.calculation.type === T.VolumeCalcMethod.DESIGN,
        )[0] as T.VolumeContent,
    };
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(props.content);

    return (
      <Provider store={store}>
        <ContentsListVolumeItem {...props} />
      </Provider>
    );
  })
  .add('dbvc-not violated', () => {
    const props: Props = {
      content: multipleContents.filter((content) =>
        content.type === T.ContentType.VOLUME && content.info.calculatedVolume.calculation.type === T.VolumeCalcMethod.DESIGN,
      )[1] as T.VolumeContent,
    };
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(props.content);

    return (
      <Provider store={store}>
        <ContentsListVolumeItem {...props} />
      </Provider>
    );
  })
  .add('sbvc', () => {
    const props: Props = {
      content: multipleContents.filter((content) =>
        content.type === T.ContentType.VOLUME && content.info.calculatedVolume.calculation.type === T.VolumeCalcMethod.SURVEY,
      )[0] as T.VolumeContent,
    };
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(props.content);

    return (
      <Provider store={store}>
        <ContentsListVolumeItem {...props} />
      </Provider>
    );
  });

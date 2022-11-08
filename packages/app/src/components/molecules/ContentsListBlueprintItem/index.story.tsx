import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import { ContentsListBlueprintItem } from './';

import { ContentsListItemMockState, createContentsListItemMockState } from '^/components/atoms/ContentsListItem/index.story';
import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import { MockStore } from 'redux-mock-store';

const pdfContent: T.BlueprintPDFContent = M.sampleContentFromType(T.ContentType.BLUEPRINT_PDF) as T.BlueprintPDFContent;
const dxfContent: T.BlueprintDXFContent = M.sampleContentFromType(T.ContentType.BLUEPRINT_DXF) as T.BlueprintDXFContent;
const dwgContent: T.BlueprintDWGContent = M.sampleContentFromType(T.ContentType.BLUEPRINT_DWG) as T.BlueprintDWGContent;
const designDxfContent: T.DesignDXFContent = M.sampleContentFromType(T.ContentType.DESIGN_DXF) as T.DesignDXFContent;

storiesOf('Molecules|ContentsListBlueprintItem', module)
  .add('pdf', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={pdfContent} />
      </Provider>
    );
  }).add('pdf-opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(pdfContent);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={pdfContent} />
      </Provider>
    );
  })
  .add('dxf', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={dxfContent} />
      </Provider>
    );
  }).add('dxf-opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(dxfContent);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={dxfContent} />
      </Provider>
    );
  })
  .add('dwg', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={dwgContent} />
      </Provider>
    );
  }).add('dwg-opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(dwgContent);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={dwgContent} />
      </Provider>
    );
  })
  .add('design-dxf', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={designDxfContent} />
      </Provider>
    );
  }).add('design-dxf-opened', () => {
    const store: MockStore<ContentsListItemMockState> = createContentsListItemMockState(designDxfContent);

    return (
      <Provider store={store}>
        <ContentsListBlueprintItem content={designDxfContent} />
      </Provider>
    );
  });

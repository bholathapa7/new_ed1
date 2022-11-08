import * as ReactTesting from '@testing-library/react';
import { JWT } from 'jwt-decode';
import Map from 'ol/Map';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as M from '^/store/Mock';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlDetailMapLayer, {
  DispatchProps,
  OwnProps,
  mapDispatchToProps,
} from './';

jest.mock('jwt-decode', () => {
  const msecInSec: number = 1000;
  const twoDaysInSec: number = 172800;

  return (): JWT => ({
    exp: Date.now() / msecInSec + twoDaysInSec,
  });
});

describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
    dispatchProps = mapDispatchToProps(dispatch);
  });

  it('should call dispatch when center is changed', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.changeCenter([0, 0]);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when zoom is changed', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.changeZoom(0);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('Connected OlDetailMapLayer', () => {
  const map: Map = new Map({});
  const props: OwnProps = {
    content: M.sampleContentFromType(T.ContentType.MAP) as T.MapContent,
  };
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should not emit an error during rendering', () => {
    expect(() => {
      ReactTesting.render(
        <Provider store={store}>
          <TestOlMapProvider value={map}>
            <OlDetailMapLayer {...props} />
          </TestOlMapProvider>
        </Provider>,
      );
    }).not.toThrowError();
  });
});

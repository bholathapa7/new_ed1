import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { sampleFullUser } from '^/store/Mock';

import AccountCard, { Props } from './';

describe('AccountCard', () => {
  const createProps: () => Props = () => ({
    authedUser: sampleFullUser,
    toMyPage: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <AccountCard {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render null if authedUser is undefined', () => {
    renderResult.rerender(
      <Provider store={store}>
        <AccountCard {...props} authedUser={undefined} />
      </Provider>,
    );
    expect(renderResult.container.children).toHaveLength(0);
  });

  it('should show appropriate avatar', () => {
    const newAvatar: string = 'asdf';
    const authedUser: Props['authedUser'] = {
      ...sampleFullUser,
      avatar: newAvatar,
    };
    renderResult.rerender(
      <Provider store={store}>
        <AccountCard {...props} authedUser={authedUser} />
      </Provider>,
    );
    expect(renderResult.queryAllByTestId('profile-img')).toHaveLength(1);
    expect(renderResult.getByTestId('profile-img').getAttribute('src')).toBe(newAvatar);
  });

  it('should show predefined icon for empty avatar', () => {
    const authedUser: Props['authedUser'] = {
      ...sampleFullUser,
      avatar: undefined,
    };
    renderResult.rerender(
      <Provider store={store}>
        <AccountCard {...props} authedUser={authedUser} />
      </Provider>,
    );
    expect(renderResult.queryAllByTestId('profile-svg')).toHaveLength(1);
  });
});

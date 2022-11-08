import { action } from '@storybook/addon-actions';
import { DecoratorFunction } from '@storybook/addons';
import { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types';
import React from 'react';
import { Provider } from 'react-redux';
import { Action, Dispatch, Middleware } from 'redux';
import makeMockStoreCreator, { MockStoreCreator } from 'redux-mock-store';

/**
 * Utility function for storybook
 */
export function makeReduxDecorator<S>(mockState: S): DecoratorFunction<StoryFnReactReturnType> {
  const logger: Middleware = () => (
    next: Dispatch,
  ) => <A extends Action>(
    a: A,
  ) => {
    action(a.type)(a);

    return next(a);
  };
  const mockStoreCreator: MockStoreCreator<S> = makeMockStoreCreator<S>([logger]);

  return (story) => <Provider store={mockStoreCreator(mockState)}>{story()}</Provider>;
}

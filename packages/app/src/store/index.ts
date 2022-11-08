import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import _ from 'lodash-es';
import {
  Reducer, Store, StoreEnhancer,
  applyMiddleware, compose as defaultCompose, createStore,
} from 'redux';
import { batchedSubscribe } from 'redux-batched-subscribe';
import { composeWithDevTools } from 'redux-devtools-extension';
import { EpicMiddleware, createEpicMiddleware } from 'redux-observable';
import { persistReducer } from 'redux-persist';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import config from '^/config';

import { EPIC_RELOAD } from '^/constants/epic';

import { State } from '^/types';
import createRootReducer, { RootAction, RootEpic, rootEpic } from './duck';
import persistConfig from './persistConfig';

const withDevtools: boolean = config.isNotProduction && config.isBrowser;

const compose: typeof defaultCompose = withDevtools ?
  composeWithDevTools({ maxAge: 500 }) :
  defaultCompose;

const epicMiddleware: EpicMiddleware<RootAction, RootAction, State> = createEpicMiddleware();

const debounceNotify: ((notify: Function) => void) = _.debounce((notify: Function) => notify());

const configStore: (
  history: History,
) => Store<State, RootAction> = (
  history,
) => {
  const enhancers: StoreEnhancer = compose(
    applyMiddleware(
      epicMiddleware,
      routerMiddleware(history),
    ) as StoreEnhancer,
    batchedSubscribe(debounceNotify),
  );

  const store: Store<State, RootAction> = createStore(
    persistReducer(
      persistConfig,
      createRootReducer(history),
    ) as Reducer<State, RootAction>,
    enhancers,
  );

  if (config.isNotProduction) {
    const epic$: BehaviorSubject<RootEpic> = new BehaviorSubject(rootEpic);
    const hotReloadingEpic: RootEpic = (
      action$, state$, dependencies,
    ) => epic$.pipe(
      switchMap((epic) => epic(action$, state$, dependencies)),
    );

    epicMiddleware.run(hotReloadingEpic);

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (module.hot && module.hot.accept) {
      module.hot.accept('./duck', () => {
        store.replaceReducer(
          persistReducer(
            persistConfig,
            createRootReducer(history),
          ) as Reducer<State, RootAction>,
        );
        epic$.next(rootEpic);
        store.dispatch({ type: EPIC_RELOAD });
      });
    }
  } else {
    epicMiddleware.run(rootEpic);
  }

  return store;
};

export default configStore;

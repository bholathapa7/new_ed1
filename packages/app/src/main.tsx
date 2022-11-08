/**
 * @desc Following import is to give a dependence between
 * this (main) chunk and the polyfill chunk.
 */

import { init as initApm } from '@elastic/apm-rum';
import * as Sentry from '@sentry/browser';
import { ConnectedRouter } from 'connected-react-router';
import { History, createBrowserHistory } from 'history';
import React, { ReactNode, StrictMode } from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools as QueryDevTools } from 'react-query/devtools';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { ErrorBoundary } from '^/components/atoms/ErrorBoundary';
import { RootErrorFallback } from '^/components/atoms/RootErrorFallback';
import { ToastifyContainer } from '^/components/atoms/ToastifyContainer';
import { CesiumContextProvider } from '^/components/cesium/CesiumContext';
import config, { NodeEnv } from '^/config';
import { RELEASE_VERSION } from '^/constants/data';
import { State } from '^/types';
import { initializeGA } from '^/utilities/load-ga';
import App from './app';
import configStore from './store';
import { UserAgent } from './types';
import { getUserAgent } from './utilities/userAgent';

// import 'tippy.js/dist/tippy.css';
// import '../node_modules/ol/ol.css';
// import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import { WindowSizeContextProvider } from './hooks';
// import './index.scss';

if (config.env !== NodeEnv.DEVELOPMENT) {
 initApm({
  serviceName: 'DDM-Frontend',
  serverUrl: 'https://8019f1aa238148978243e73e8ee9fc7a.apm.ap-northeast-1.aws.cloud.es.io',
  serviceVersion: RELEASE_VERSION,
  environment: config.buildLevel,
 });
}

if (config.env !== NodeEnv.DEVELOPMENT) {
 /* istanbul ignore next */
 Sentry.init({
  dsn: 'https://10ffd1e6237547a792a79bab07719aee@sentry.io/1864893',
  environment: config.env,
  release: config.env === 'production' ? RELEASE_VERSION : undefined,
 });
}

/* istanbul ignore next */
initializeGA();

const history: History = createBrowserHistory();
const store: Store<State> = configStore(history);

/* istanbul ignore next */
if (config.isBrowser && !config.isNotProduction) {
 history.listen((location) => {
  // Record page changes as pageview to GA
  ga('set', 'page', location.pathname);
  ga('send', 'pageview', { title: 'page-change' });
 });

 ga('send', 'pageview', {
  title: 'initial',
 });
}

if (getUserAgent() === UserAgent.IE) {
 let msg: string;

 if (navigator.language.includes('ko')) {
  msg =
   '엔젤스윙 플랫폼은 Chrome 브라우저에 최적화되어 있습니다. 사용자분들께서는 Chrome을 통해 엔젤스윙 플랫폼을 이용해주시면 감사하겠습니다.';
 } else {
  // eslint-disable-next-line max-len
  msg =
   "[Important notice] Angelswing's website is best optimized for Chrome browser. Please use Chrome to have the best experience on Angelswing.";
 }

 window.alert(msg);
}

// eslint-disable-next-line: @typescript-eslint/strict-boolean-expressions
if (getUserAgent() === UserAgent.SAFARI && window.TouchEvent) {
 document.body.style.cssText = `${document.body.style.cssText}-webkit-touch-callout: none;`;
 document.body.style.webkitUserSelect = 'none';
 document.body.addEventListener('click', (e) => {
  if (e.target) (e.target as HTMLElement).focus();
 });
}

const queryClient: QueryClient = new QueryClient();

const renderApp: () => void = () => {
 const queryDevTools: ReactNode = config.isReactQueryDevtoolsOn ? (
  <QueryDevTools initialIsOpen={false} position="top-right" />
 ) : null;

 render(
  <StrictMode>
   <ErrorBoundary fallback={<RootErrorFallback />}>
    <Provider store={store}>
     <QueryClientProvider client={queryClient}>
      {queryDevTools}
      <CesiumContextProvider>
       <WindowSizeContextProvider>
        <PersistGate loading={<div>Loading...</div>} persistor={persistStore(store)}>
         <ConnectedRouter history={history}>
          <ToastifyContainer />
          <App />
         </ConnectedRouter>
        </PersistGate>
       </WindowSizeContextProvider>
      </CesiumContextProvider>
     </QueryClientProvider>
    </Provider>
   </ErrorBoundary>
  </StrictMode>,
  document.getElementById('root')
 );
};

renderApp();

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (module.hot && module.hot.accept) {
 module.hot.accept('./app', () => {
  renderApp();
 });
}

import { ApmRoute } from '@elastic/apm-rum-react';
import React, { Component, ComponentType, FC, ReactNode, Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';

import { TrustedServers } from 'cesium';

import config from '^/config';

import palette from '^/constants/palette';

import minDelayPromise from '^/utilities/min-delay-promise';

import * as T from '^/types';

import NotificationTopbar from '^/components/atoms/NotificationTopbar';
import LoadingScreen from '^/components/molecules/LoadingScreen';
import { Initializer } from './components/atoms/Initializer';
import GuideButton from './components/atoms/GuideButton';

import routes from '^/constants/routes';
import { TUTORIAL_PORTAL_ID } from './components/atoms/TutorialWrapperHoverable';
import { UserAgent } from './types';
import { getUserAgent } from './utilities/userAgent';
import { getTrackId, activateGA } from './utilities/load-ga';
// This is required to make sure the Tile requests include Cookie (CloudFront)
// eslint-disable-next-line no-magic-numbers
TrustedServers.add('dev-storage.angelswing.io', 443);
// eslint-disable-next-line no-magic-numbers
TrustedServers.add('storage.angelswing.io', 443);

const minDelayForPage: number = 1500;
const fallbackNode: NonNullable<ReactNode> = (
 <LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} />
);

/**
 * @desc This is a monkeypatch for a bug caused by a conflict
 * between react-router-dom package and `React.lazy`.
 * @todo Remove this component after react-router-dom@4.4 is released.
 * @todo Use an appropriate fallback instead of current one.
 */
function Waitable<P>(Comp: ComponentType<P>): FC<P> {
 return (props) => (
  <Suspense fallback={fallbackNode}>
   <Comp {...props} />
  </Suspense>
 );
}

/**
 * @see https://webpack.js.org/guides/code-splitting/
 * @see https://webpack.js.org/api/module-methods/#magic-comments
 */

const LoginPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "Login" */
  minDelayPromise(import('^/components/pages/LoginPage'), minDelayForPage)
 )
);
const PrivatePolicyPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "PrivatePolicy" */
  minDelayPromise(import('^/components/pages/PrivatePolicyPage'), minDelayForPage)
 )
);
const SignupApprovalPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "SignupApproval" */
  minDelayPromise(import('^/components/pages/SignupApprovalPage'), minDelayForPage)
 )
);
const SignupRequestPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "SignupRequest" */
  minDelayPromise(import('^/components/pages/SignupRequestPage'), minDelayForPage)
 )
);
const TermsPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "Terms" */
  minDelayPromise(import('^/components/pages/TermsPage'), minDelayForPage)
 )
);

const ContentPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "Content" */
  minDelayPromise(import('^/containers/pages/ContentPage'), minDelayForPage)
 )
);
const PasswordPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "Password" */
  minDelayPromise(import('^/containers/pages/PasswordPage'), minDelayForPage)
 )
);
const PasswordResetPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "PasswordReset" */
  minDelayPromise(import('^/containers/pages/PasswordResetPage'), minDelayForPage)
 )
);
const ProjectPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "Project" */
  minDelayPromise(import('^/components/pages/ProjectPage'), minDelayForPage)
 )
);
const SharePage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "Share" */
  minDelayPromise(import('^/containers/pages/SharePage'), minDelayForPage)
 )
);
const SignUpPage = Waitable(
 lazy(async () =>
  /* webpackChunkName: "SignUp" */
  minDelayPromise(import('^/containers/pages/SignUpPage'), minDelayForPage)
 )
);

const UnauthedRedirect: ReactNode = <Redirect key="*" from="/" to={routes.login.main} />;

/**
 * @todo
 * Change this into fragment
 * after `<Switch />` issue is solved.
 */
const UnauthedRoute: ReactNode = [
 <ApmRoute key="root-to-login" path="/" exact={true} component={LoginPage} />,
 <ApmRoute key={routes.login.main} path={routes.login.main} exact={true} component={LoginPage} />,
 <ApmRoute
  key={routes.password.main}
  path={routes.password.main}
  exact={true}
  component={PasswordPage}
 />,
 <ApmRoute
  key={routes.password.reset}
  path={routes.password.reset}
  exact={true}
  component={PasswordResetPage}
 />,
 <ApmRoute
  key={routes.signup.main}
  path={routes.signup.main}
  exact={true}
  component={SignUpPage}
 />,
 <ApmRoute
  key={routes.signup.request}
  path={routes.signup.request}
  exact={true}
  component={SignupRequestPage}
 />,
 <ApmRoute
  key={routes.signup.processing}
  path={routes.signup.processing}
  exact={true}
  component={SignupApprovalPage}
 />,
 <ApmRoute key={routes.share.main} path={routes.share.main} exact={true} component={SharePage} />,
 <ApmRoute
  key={routes.externalLink.privatePolicy}
  path={routes.externalLink.privatePolicy}
  exact={true}
  component={PrivatePolicyPage}
 />,
 <ApmRoute
  key={routes.externalLink.terms}
  path={routes.externalLink.terms}
  exact={true}
  component={TermsPage}
 />,
 UnauthedRedirect,
];

const getAuthedRoute: (redirectPath: string) => ReactNode = (redirectPath) => [
 <ApmRoute
  key={routes.project.main}
  path={routes.project.main}
  exact={true}
  component={ProjectPage}
 />,
 <ApmRoute
  key={routes.project.manage}
  path={routes.project.manage}
  exact={true}
  component={ProjectPage}
 />,
 <ApmRoute
  key={routes.project.mypage}
  path={routes.project.mypage}
  exact={true}
  component={ProjectPage}
 />,
 <ApmRoute
  key={routes.content.main}
  path={routes.content.main}
  exact={true}
  component={ContentPage}
 />,
 <ApmRoute key={routes.share.main} path={routes.share.main} exact={true} component={SharePage} />,
 <Redirect key="*" to={redirectPath} />,
];

// Default authed routes should always fallback and redirect to projects page.
const defaultAuthedRoute: ReactNode = getAuthedRoute(routes.project.main);

export interface Props {
 readonly isAuthorized: boolean;
 readonly pathBeforeAuth?: string;
}

type StatePropsKey = 'isAuthorized' | 'pathBeforeAuth';
type DispatchPropsKey = never;
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (state: Pick<T.State, 'Auth'>) => StateProps = ({ Auth }) => ({
 isAuthorized: Auth.authedUser !== undefined,
 pathBeforeAuth: Auth.pathBeforeAuth,
});

/**
 * App component class
 */
class App extends Component<Props> {
 private loggedInAt: Date;
 private readonly userAgent: UserAgent;

 public constructor(props: Props) {
  super(props);

  this.loggedInAt = new Date();
  this.userAgent = getUserAgent();
 }

 public shouldComponentUpdate(nextProps: Props): boolean {
  /* istanbul ignore next */
  if (config.isBrowser && !config.isNotProduction) {
   if (nextProps.isAuthorized !== this.props.isAuthorized) {
    ga('send', 'event', {
     eventCategory: 'Auth',
     eventAction: nextProps.isAuthorized ? 'login' : 'logout',
    });

    if (nextProps.isAuthorized) {
     this.loggedInAt = new Date();
    } else {
     ga('send', 'timing', {
      timingCategory: 'UserTime',
      timingVar: 'loggedInWhile',
      timingValue: new Date().valueOf() - this.loggedInAt.valueOf(),
     });
    }
   }
  }

  return true;
 }

 public render(): ReactNode {
  const isBrowserNotificationShown: boolean = ![
   UserAgent.CHROME,
   UserAgent.EDGE,
   UserAgent.SAFARI,
  ].includes(this.userAgent);
  const content: ReactNode = (() => {
   if (!this.props.isAuthorized) {
    return UnauthedRoute;
   }

   if (this.props.pathBeforeAuth === undefined) {
    return defaultAuthedRoute;
   }

   return getAuthedRoute(this.props.pathBeforeAuth);
  })();

  const GATrackInput: ReactNode = activateGA ? (
   <input type="hidden" id="ddm-ua-track-id" value={getTrackId()} />
  ) : null;

  return (
   <>
    {GATrackInput}
    <Initializer />
    <GuideButton />
    <div id={TUTORIAL_PORTAL_ID} />
    {this.props.isAuthorized && isBrowserNotificationShown ? <NotificationTopbar /> : null}
    <Switch>{content}</Switch>
   </>
  );
 }
}
export default connect(mapStateToProps, undefined, undefined, { pure: false })(App);

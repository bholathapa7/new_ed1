import { matchPath } from 'react-router-dom';

export const useRouteIsMatching: (path: string) => boolean = (path) => Boolean(matchPath(window.location.pathname, { path }));

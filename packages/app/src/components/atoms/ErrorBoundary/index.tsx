import Sentry from '@sentry/browser';
import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface Props {
  fallback?: ReactNode;
}

export interface State {
  error?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {};
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry?.captureException(error);
    this.setState({
      error: errorInfo,
    });
  }

  public render(): ReactNode {
    const { error }: State = this.state;
    const { fallback }: Props = this.props;
    if (error) {
      if (fallback) {
        return (
          <>
            {fallback}
          </>
        );
      }

      // Hide component if fallback is not defined
      return (<></>);
    }

    return this.props.children;
  }
}

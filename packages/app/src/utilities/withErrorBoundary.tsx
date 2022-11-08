import React, { ComponentType, FC } from 'react';

import { ErrorBoundary } from '^/components/atoms/ErrorBoundary';

export function withErrorBoundary<Props>(Component: ComponentType<Props>): (Fallback: ComponentType) => FC<Props> {
  return (Fallback) => ({ ...props }: Props) => (
    <ErrorBoundary fallback={<Fallback {...props} />}>
      <Component {...props} />
    </ErrorBoundary>
  );
}

import { FC, useEffect } from 'react';

import { usePrevProps } from '^/hooks';
import * as T from '^/types';

export interface Props {
  readonly status: T.APIStatus;
  onSuccess(): void;
  onError(): void;
}

const ApiDetector: FC<Props> = ({
  status, onSuccess, onError,
}) => {
  const prevStatus = usePrevProps(status);

  useEffect(() => {
    if (prevStatus === T.APIStatus.PROGRESS && status === T.APIStatus.SUCCESS) onSuccess();
    if (prevStatus === T.APIStatus.PROGRESS && status === T.APIStatus.ERROR) onError();
  }, [status]);

  return null;
};

export default ApiDetector;

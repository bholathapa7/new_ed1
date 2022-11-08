import React, { FC, useEffect } from 'react';

import * as T from '^/types';

export const CANCELLABLE_CLASS_NAME: HTMLElement['className'] = '_cancellable';

export interface Props {
  creatingVolumeType?: T.VolumeCalcMethod;
  onOpenPopup(): void;
}

export const CreatingVolumeClickEventHandler: FC<Props> = ({ creatingVolumeType, onOpenPopup }) => {
  useEffect(() => {
    document.removeEventListener('click', clickEventHandler, true);
    if (creatingVolumeType !== undefined) {
      document.addEventListener('click', clickEventHandler, true);
    }

    return () => {
      document.removeEventListener('click', clickEventHandler, true);
    };
  });

  const clickEventHandler: (e: MouseEvent) => void = (e) => {
    const target: HTMLElement | null = (e.target as HTMLElement | null);

    if (creatingVolumeType !== undefined && target?.closest(`.${CANCELLABLE_CLASS_NAME}`) !== null) {
      e.stopPropagation();
      onOpenPopup();
    }
  };

  return <></>;
};

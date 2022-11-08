import React, { ReactNode } from 'react';

import DBVCPopup from '^/components/organisms/DBVCPopup';
import DBVCPopup3D from '^/components/organisms/DBVCPopup/3d';
import SBVCPopup from '^/components/organisms/SBVCPopup';

import * as T from '^/types';

import { exhaustiveCheck } from '^/utilities/exhaustive-check';

export const selectVolumeCalcPopup: (
  popup?: T.ContentPagePopupOnMapType, isIn3D?: boolean,
) => ReactNode = (
  popup, isIn3D = false,
) => {
  const zIndexPopup: number = 300; // Enable the background of popups to overlay of sidebar

  switch (popup) {
    case T.ContentPagePopupOnMapType.DESIGN_DXF_SELECT:
      return isIn3D ? <DBVCPopup3D zIndex={zIndexPopup} /> : <DBVCPopup zIndex={zIndexPopup} />;
    case T.ContentPagePopupOnMapType.SURVEY_SELECT:
      return <SBVCPopup zIndex={zIndexPopup} />;
    case undefined:
      return undefined;

    /* istanbul ignore next: exhaustive check is validated by type checking */
    default:
      return exhaustiveCheck(popup);
  }
};

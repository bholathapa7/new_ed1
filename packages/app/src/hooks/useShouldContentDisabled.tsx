import { useSelector } from 'react-redux';

import * as T from '^/types';

export type UseShouldContentDisabled = ReturnType<typeof useShouldContentDisabled>;

export function useShouldContentDisabled<Content extends T.Content>(contentType: Content['type']): boolean {
  return useSelector((s: T.State) => {
    const isUnsupportedOnCesium: boolean =
      s.Pages.Contents.in3D &&
      !s.Pages.Contents.in3DPointCloud &&
      contentType === T.ContentType.BLUEPRINT_PDF;
    const isUnsupportedOnPrintingPage: boolean =
      Boolean(s.Pages.Contents.printingContentId) &&
      (contentType === T.ContentType.BLUEPRINT_PDF || contentType === T.ContentType.DESIGN_DXF);

    return isUnsupportedOnCesium || isUnsupportedOnPrintingPage;
  });
}

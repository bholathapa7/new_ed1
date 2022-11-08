import download from '^/utilities/download';
import html2canvas from 'html2canvas';

import * as T from '^/types';
import { TryCatchOutput, tryCatch } from '^/utilities/async-util';
import { getUserAgent } from './userAgent';

export const runScreenCapture: (element: HTMLElement, capturedFileName: string) => Promise<void> =
  async (element, capturedFileName) => {
    /**
     * @description When browser is webkit based
     * and usePopup parameter of download function is false, then the browser redirects to blob url.
     */
    const isWebkit: boolean = getUserAgent() === T.UserAgent.SAFARI;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const { data, error }: TryCatchOutput<HTMLCanvasElement> = await tryCatch(html2canvas(element, {
      allowTaint: true,
      useCORS: true,
    }) as Promise<HTMLCanvasElement>);

    if (!error && data) {
      download(data.toDataURL(), isWebkit, true, capturedFileName);
    }
  };

interface TwoDHandleCameraClickParams {
  onStart(): void;
  onEnd(): void;
  mainScreenCaptureFunction(): Promise<void>;
}

type TwoDHandleCameraClick = ({
  onStart,
  onEnd,
  mainScreenCaptureFunction,
}: TwoDHandleCameraClickParams) => () => Promise<void>;

export const handleCameraClickFunctor: TwoDHandleCameraClick = ({
  onStart,
  onEnd,
  mainScreenCaptureFunction,
}) => async () => {
  onStart();
  await mainScreenCaptureFunction();
  onEnd();
};

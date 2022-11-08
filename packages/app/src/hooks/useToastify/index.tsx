import React, { useEffect } from 'react';
import { ToastContainerProps, ToastOptions, toast } from 'react-toastify';

import { ToastifyContent } from '^/components/atoms/ToastifyContent';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { L10nDictionary } from '^/utilities/l10n';

export const NOT_ALLOWED_CLASS_NAME: string = 'not-allowed';
export const TOASTIFY_MAX_STACK: number = 6;
export const TOASTIFY_DURATION: number = 5000;

export const defaultToastContainerOption: ToastContainerProps = {
  limit: TOASTIFY_MAX_STACK,
  newestOnTop: true,
  rtl: false,
  pauseOnFocusLoss: true,
};

export const defaultToastErrorOption: ToastOptions = {
  position: 'bottom-right',
  autoClose: TOASTIFY_DURATION,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

export const defaultToastInfoOption: ToastOptions = {
  position: 'bottom-right',
  autoClose: TOASTIFY_DURATION,
  hideProgressBar: true,
  closeOnClick: false,
  closeButton: false,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

export type UseToast = (param: ToastParam) => void;

interface ToastParam {
  type: T.Toast;
  content: {
    title?: L10nDictionary;
    description?: L10nDictionary;
  };
  option?: ToastOptions;
}

export function useToast(): UseToast {
  const [l10n]: UseL10n = useL10n();

  return (param) => {
    const { type, content: { title: rawTitle, description: rawDescription }, option }: ToastParam = param;
    const title: string | undefined = rawTitle ? l10n(rawTitle) : undefined;
    const description: string | undefined = rawDescription ? l10n(rawDescription) : undefined;

    toast[type](<ToastifyContent type={type} title={title} description={description} />, {
      ...option,
    });
  };
}

export function useInitialToast(param: ToastParam): void {
  const toastify: UseToast = useToast();

  useEffect(() => {
    toastify(param);
  }, []);
}

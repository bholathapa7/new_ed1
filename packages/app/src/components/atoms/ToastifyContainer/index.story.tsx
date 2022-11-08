import { storiesOf } from '@storybook/react';
import React, { FC, ReactNode, MouseEvent } from 'react';
import { Provider } from 'react-redux';
import { toast } from 'react-toastify';

import { ToastifyContent } from '^/components/atoms/ToastifyContent';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { ToastifyContainer } from './';

import '../../../../node_modules/react-toastify/dist/ReactToastify.min.css';


const toastContent = {
  title: {
    [T.Language.EN_US]: 'Englishtitleitietketieitei',
    [T.Language.KO_KR]: '한글제목',
  },
  description: {
    [T.Language.EN_US]: 'Englishtitleitietketieitei',
    [T.Language.KO_KR]: 'ㄱㄴㄷㄻㅄㅇㅈasdasdasdasdasdasddadsㅊㅋㅌㅍㅎㄱㄴㄷㄻㅄㅇㅈㅊㅋㅌㅍㅎ',
  },
  [T.Language.EN_US]: 'Englishtitleitietketieitei',
  [T.Language.KO_KR]: '한글제목',
};


const Toastify: FC = () => {
  const [l10n]: UseL10n = useL10n();

  const showToast: (type: T.Toast) => (e: MouseEvent<HTMLDivElement>) => void = (type) => () => {
    toast[type](<ToastifyContent title={l10n(toastContent.title)} description={l10n(toastContent.description)} />, {
      position: 'bottom-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const buttons: ReactNode =
    [T.Toast.DARK, T.Toast.ERROR, T.Toast.INFO, T.Toast.SUCCESS, T.Toast.WARNING].map((toastType) => (
      <div onClick={showToast(toastType)} key={toastType}>
        {toastType}
      </div>
    ));

  return (
    <>{buttons}</>
  );
};

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

storiesOf('Atoms|ToastifyContainer', module)
  .add('default', () => (
    <Provider store={store}>
      <ToastifyContainer />
      <Toastify />
    </Provider>
  ));

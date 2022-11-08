import React, { FC, ReactNode, useMemo } from 'react';
import styled from 'styled-components';

import * as T from '^/types';

import { ShareBanner } from '^/components/molecules/ShareBanner';
import ContentImagePopup from '^/containers/molecules/ContentImagePopup';
import TwoDShareDisplay from '^/containers/organisms/TwoDShareDisplay';

const Root = styled.div({
  width: '100%',
  height: '100%',

  overflow: 'hidden',
});

export interface Props {
  readonly sharedContentsStatus: T.APIStatus;
  readonly sharedContentsError?: T.HTTPError;
  readonly popup?: T.ContentPagePopupType;
}

const SharePage: FC<Props> = (
  props,
) => {
  const imagePopup: ReactNode = useMemo(() => props.popup === T.ContentPagePopupType.IMAGE ?
    // eslint-disable-next-line
    <ContentImagePopup zIndex={20} /> :
    undefined,
  [props.popup]);

  if (props.sharedContentsStatus === T.APIStatus.SUCCESS) {
    return (
      <Root>
        <ShareBanner />
        <TwoDShareDisplay />
        {imagePopup}
      </Root>
    );
  }

  if (props.sharedContentsStatus === T.APIStatus.ERROR) {
    switch (props.sharedContentsError) {
      case T.HTTPError.CLIENT_ERROR:
        return (
          <div>주소가 만료되었거나 없는 주소입니다. 주소를 다시 확인해주세요.</div>
        );
      case T.HTTPError.CLIENT_AUTH_ERROR:
        return (
          <div>주소가 만료되었거나 없는 주소입니다. 주소를 다시 확인해주세요.</div>
        );
      case T.HTTPError.SERVER_ERROR:
        return (
          <div>서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.</div>
        );
      default:
        return (
          <div>알 수 없는 문제가 발생했습니다. 다시 시도해주세요.</div>
        );
    }
  }

  return (
    <div>Loading...</div>
  );
};
export default SharePage;

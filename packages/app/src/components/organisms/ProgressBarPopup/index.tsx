import * as _ from 'lodash-es';
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import * as T from '^/types';
import Text from './text';

import formatValue from '^/utilities/value-format';

import ApiDetector from '^/components/atoms/ApiDetector';
import { ConfirmButton as CancelButton } from '^/components/atoms/Buttons';
import GuageBar from '^/components/atoms/GuageBar';
import Popup from '^/components/molecules/Popup';
import { FontFamily } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import dsPalette from '^/constants/ds-palette';

const Root = styled.div({
  width: '313px',
  padding: '50px',
  paddingTop: '45.4px',
  paddingBottom: '34.7px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const InfoWrapper = styled.div({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexGrow: 1,

  marginBottom: '13px',

  fontSize: '14px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: dsPalette.title.toString(),
});

const ProgressPercent = styled.span({
  fontFamily: FontFamily.ROBOTO,
  fontSize: '20px',
  fontWeight: 500,
  color: 'var(--color-theme-primary)',
});

const ProgressInfo = styled.div({
  display: 'flex',
});

const ButtonWrapper = styled.div({
  marginTop: '41.1px',
});

export interface Props {
  readonly zIndex: number;
  readonly content: T.UploadContent;
  readonly uploadStatus: { [hash: string]: T.AttachmentPostStatus };
  onCancel(type: T.AttachmentType, contentId: T.Content['id'], hash: string | Array<string>): void;
  onComplete(contentId: T.Content['id']): void;
}

const backgroundAlpha: number = 0.45;
const sec: number = 1000;
const min: number = 60;
const hour: number = 3600;
const maxPercent: number = 100;

const ProgressBarPopup: FC<Props> = ({
  zIndex, uploadStatus, content, onCancel, onComplete,
}) => {
  const [l10n]: UseL10n = useL10n();

  const { id: contentId, status: apiStatus }: T.UploadContent = content;
  const files: T.UploadContent['file'] = content.file;
  const hashes: Array<string> = _.map(files, (file: T.UploadContent['file'][0]) => file.hash);

  const fileSize: number = _.sumBy(files, (file: T.UploadContent['file'][0]) => file.size);
  const fileSizeString: string = formatValue(
    fileSize, { unit: 'B', gap: 1024, digit: 2 },
  );

  const handleCancel: () => void = () => {
    onCancel(content.type, contentId, hashes);
  };

  const handleComplete: () => void = () => {
    onComplete(content.id);
  };

  let progressRatio: number = 0;
  for (const hash of Object.keys(uploadStatus)) {
    const postStatus: T.AttachmentPostStatus = uploadStatus[hash];
    progressRatio += postStatus.progress;
  }
  progressRatio = progressRatio ? progressRatio / fileSize : progressRatio;

  const inProgressText: number = Math.floor(progressRatio * maxPercent);

  const totalTookSec: number = Math.floor((Date.now() - content.uploadedAt.valueOf()) / sec);
  const progressSec: number = totalTookSec / (progressRatio * maxPercent);
  const totalLeftSec: number = (maxPercent - progressRatio * maxPercent) * progressSec;

  const leftHour: number = Math.floor(totalLeftSec / hour);
  const leftMin: number = Math.floor((totalLeftSec - (leftHour * hour)) / min);
  const leftSec: number = Math.round(totalLeftSec % min);

  const leftTimeFunc: () => string = () => {
    if (!progressRatio) {
      return '';
    }

    const hr: string = leftHour > 0 ?
      `${leftHour}${l10n(Text.hour)}` : '';

    const m: string = leftMin > 0 ?
      `${leftMin}${l10n(Text.minute)}` : '';

    const s: string = leftMin > 0 && leftSec > 0 ?
      '' : `${leftSec}${l10n(Text.second)}`;

    const left: string = l10n(Text.left);

    return [hr, m, s, left, '| '].filter((val: string) => val.length).join(' ');
  };

  const info: ReactNode = (
    <>
      <ProgressPercent data-testid='progress-ratio'>
        {inProgressText}%
      </ProgressPercent>
      <ProgressInfo>
        {leftTimeFunc()}
        {`${l10n(Text.total)} ${fileSizeString}`}
      </ProgressInfo>
    </>
  );

  return (
    <Popup
      title={l10n(Text[content.type])}
      hasBlur={true}
      zIndex={zIndex}
      alpha={backgroundAlpha}
      closeTooltipText={l10n(Text.cancel)}
      onCloseClick={handleCancel}
    >
      <Root>
        <InfoWrapper>{info}</InfoWrapper>
        <GuageBar ratio={progressRatio} />
        <ButtonWrapper>
          <CancelButton data-testid='cancel-button' onClick={handleCancel}>{l10n(Text.cancel)}</CancelButton>
        </ButtonWrapper>
      </Root>
      <ApiDetector
        status={apiStatus}
        onSuccess={handleComplete}
        onError={handleComplete}
      />
    </Popup>
  );
};

export default ProgressBarPopup;

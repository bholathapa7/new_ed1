import React, { ReactElement, memo, useCallback } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';

import RawCheckSVG from '^/assets/icons/check.svg';
import ThreeDMeshPreviewPNG from '^/assets/icons/upload-popup/3d-mesh-preview.png';
import ThreeDOrthoPreviewPNG from '^/assets/icons/upload-popup/3d-ortho-preview.png';
import BetaSVG from '^/assets/icons/upload-popup/beta.svg';
import CardOption, { Props as CardOptionProps } from '^/components/atoms/CardOption';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, useL10n } from '^/hooks';
import Text from './text';


const Item = styled.li({
  margin: '30px',
});

const Label = styled.p({
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '10px',

  color: dsPalette.title.toString(),
});

const OptionsWrapper = styled.div({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
});

const CheckSVG = styled(RawCheckSVG)({
  marginRight: '7px',
});

const InfoLabel = styled(Label)({
  color: 'var(--color-theme-primary)',
});

const Images = styled.ul({
  listStyle: 'none',

  width: '100%',
  marginBottom: '10px',

  display: 'flex',
  justifyContent: 'space-between',
});

const InfoDescription = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
  lineHeight: '20px',
  wordBreak: 'keep-all',
});

const InfoDescription2 = styled.p({
  fontSize: '12px',
  color: dsPalette.title.toString(),
  lineHeight: '20px',
  wordBreak: 'keep-all',

  marginTop: '10px',
});


const optionCustomStyle: CardOptionProps['customStyle'] = {
  card: {
    default: {
      width: '148px',
      height: '230px',
      marginBottom: '10px',
    },
    image: { width: '33px', height: '16px' },
    title: { height: '36px', fontSize: '13px' },
    description: { fontSize: '12px' },
  },
  checkbox: {
    width: '20px',
    height: '20px',
  },
};

export interface Props {
  readonly isMeshOption: boolean | null;
  onChange(isUsingOption: boolean | null): void;
}

function MeshOptionInput({
  isMeshOption, onChange,
}: Props): ReactElement {
  const [l10n]: UseL10n = useL10n();

  const handleOldOptionClick: () => void = useCallback(() => {
    onChange(false);
  }, [onChange]);
  const handleMeshOptionClick: () => void = useCallback(() => {
    onChange(true);
  }, [onChange]);

  return (
    <Scrollbars>
      <Item>
        <Label>{l10n(Text.label)}</Label>
        <OptionsWrapper>
          <CardOption
            customStyle={optionCustomStyle}
            isSelected={isMeshOption === false}
            title={l10n(Text.oldOption.title)}
            description={l10n(Text.oldOption.description)}
            onSelect={handleOldOptionClick}
          />
          <CardOption
            customStyle={optionCustomStyle}
            isSelected={isMeshOption === true}
            image={<BetaSVG />}
            title={l10n(Text.meshOption.title)}
            description={l10n(Text.meshOption.description)}
            onSelect={handleMeshOptionClick}
          />
        </OptionsWrapper>
      </Item>
      <Item>
        <InfoLabel>
          <CheckSVG />
          {l10n(Text.meshInfo.title)}
        </InfoLabel>
        <Images>
          <li><img src={ThreeDOrthoPreviewPNG} alt='3d-ortho-preview' /></li>
          <li><img src={ThreeDMeshPreviewPNG} alt='3d-mesh-preview' /></li>
        </Images>
        <InfoDescription>{l10n(Text.meshInfo.description1)}</InfoDescription>
        <InfoDescription2>{l10n(Text.meshInfo.description2)}</InfoDescription2>
      </Item>
    </Scrollbars>
  );
}

export default memo(MeshOptionInput);

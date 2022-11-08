import _ from 'lodash-es';
import React, { FC,useCallback, useState, useEffect } from 'react';
import styled, { CSSObject } from 'styled-components';

import TutorialAverageEN from '^/assets/icons/tutorial/volume-average-en.png';
import TutorialAverageKR from '^/assets/icons/tutorial/volume-average-kr.png';
import TutorialTriangulatedEN from '^/assets/icons/tutorial/volume-basic-en.png';
import TutorialTriangulatedKR from '^/assets/icons/tutorial/volume-basic-kr.png';
import TutorialCustomEN from '^/assets/icons/tutorial/volume-custom-en.png';
import TutorialCustomKR from '^/assets/icons/tutorial/volume-custom-kr.png';
import TutorialHighestEN from '^/assets/icons/tutorial/volume-highest-en.png';
import TutorialHighestKR from '^/assets/icons/tutorial/volume-highest-kr.png';
import TutorialLowestEN from '^/assets/icons/tutorial/volume-lowest-en.png';
import TutorialLowestKR from '^/assets/icons/tutorial/volume-lowest-kr.png';
import Dropdown, {
  Option as DropdownOption,
} from '^/components/atoms/Dropdown';
import { TutorialPosition } from '^/components/atoms/TutorialWrapperHoverable';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import palette from '^/constants/palette';
import tutorial from '^/constants/tutorial';
import { UseL10n, useL10n, usePrevProps } from '^/hooks';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const TUTORIAL_WIDTH: number = 226;
const TUTORIAL_MARGIN: number = 5;


const Root = styled.div({
  display: 'block',
});
Root.displayName = 'VolumeAlgorithmDropdown';

const TriangulatedTutorialImg = styled.img({
  width: '100%',
  height: '71px',

  marginTop: '10px',
  marginBottom: '11px',
});

const LowestTutorialImg = styled.img({
  width: '100%',
  height: '48px',

  marginTop: '27px',
  marginBottom: '15px',
});

const HighestTutorialImg = styled.img({
  width: '100%',
  height: '44px',

  marginTop: '26px',
  marginBottom: '19px',
});

const AverageTutorialImg = styled.img({
  width: '100%',
  height: '43px',

  marginTop: '32px',
  marginBottom: '15px',
});

const CustomTutorialImg = styled.img({
  width: '100%',
  height: '47px',

  marginTop: '31px',
  marginBottom: '12px',
});


const dropdownMainButtonStyle: CSSObject = {
  color: palette.textGray.toString(),

  borderColor: palette.textGray.toString(),
};

const volumeAlgorithms: Array<T.BasicCalcBasePlane> = [
  T.BasicCalcBasePlane.LOWEST_POINT,
  T.BasicCalcBasePlane.HIGHEST_POINT,
  T.BasicCalcBasePlane.AVERAGE,
  T.BasicCalcBasePlane.TRIANGULATED,
  T.BasicCalcBasePlane.CUSTOM,
];
export const volumeAlgorithmLabel: (
  volumeType: T.BasicCalcBasePlane, language: T.Language,
) => string = (volumeType, language) => {
  switch (volumeType) {
    case T.BasicCalcBasePlane.LOWEST_POINT:
      return l10n(Text.itemTitle.lowestPoint, language);
    case T.BasicCalcBasePlane.HIGHEST_POINT:
      return l10n(Text.itemTitle.highestPoint, language);
    case T.BasicCalcBasePlane.AVERAGE:
      return l10n(Text.itemTitle.average, language);
    case T.BasicCalcBasePlane.TRIANGULATED:
      return l10n(Text.itemTitle.triangulated, language);
    case T.BasicCalcBasePlane.CUSTOM:
      return l10n(Text.itemTitle.customElevation, language);
    default:
      return 'undefined';
  }
};

const getAlgorithmElevation: (c: T.VolumeContent) => ({
  volumeAlgorithm: T.BasicCalcBasePlane;
  volumeElevation: number;
}) = (content) => {
  const { calculatedVolume: { calculation } }: T.VolumeContent['info'] = content.info;

  return {
    volumeAlgorithm: calculation.volumeAlgorithm,
    volumeElevation: calculation.volumeElevation,
  };
};

interface VolumeCalcTutorialImageProps {
  type: T.BasicCalcBasePlane;
}

const VolumeCalcTutorialImage: FC<VolumeCalcTutorialImageProps> = ({ type }) => {
  const [, language]: UseL10n = useL10n();

  const getImageByLanguage: (img1: string, img2: string) => string = useCallback((img1, img2) => language === T.Language.KO_KR ? img1 : img2, []);

  switch (type) {
    case T.BasicCalcBasePlane.TRIANGULATED:
      return <TriangulatedTutorialImg src={getImageByLanguage(TutorialTriangulatedKR, TutorialTriangulatedEN)} />;
    case T.BasicCalcBasePlane.LOWEST_POINT:
      return <LowestTutorialImg src={getImageByLanguage(TutorialLowestKR, TutorialLowestEN)} />;
    case T.BasicCalcBasePlane.HIGHEST_POINT:
      return <HighestTutorialImg src={getImageByLanguage(TutorialHighestKR, TutorialHighestEN)} />;
    case T.BasicCalcBasePlane.AVERAGE:
      return <AverageTutorialImg src={getImageByLanguage(TutorialAverageKR, TutorialAverageEN)} />;
    case T.BasicCalcBasePlane.CUSTOM:
      return <CustomTutorialImg src={getImageByLanguage(TutorialCustomKR, TutorialCustomEN)} />;

    default:
      exhaustiveCheck(type);
  }
};

const getVolumeAlgoTutorialProps: (
  volumeCalcType: T.BasicCalcBasePlane, language: T.Language,
) => NonNullable<DropdownOption['tutorial']> = (volumeCalcType, language) => ({
  width: TUTORIAL_WIDTH,
  margin: TUTORIAL_MARGIN,
  position: TutorialPosition.RIGHT_BOTTOM,
  title: l10n(Text.tutorial[volumeCalcType].title, language),
  description: l10n(Text.tutorial[volumeCalcType].description, language),
  image: <VolumeCalcTutorialImage type={volumeCalcType} />,
  link: tutorial.volumeCalculation,
  isZendesk: true,
  customStyle: {
    root: { width: '100%' },
    target: { width: '100%' },
  },
});

export interface State {
  readonly volumeAlgorithm: T.BasicCalcBasePlane | undefined;
  readonly volumeElevation: number;
}

export interface Props {
  content: T.VolumeContent;
  onSelect(volumeAlgorithm: T.BasicCalcBasePlane, volumeElevation?: number): void;
}

/**
 * Component for selecting Volume calculation volumeAlgorithm
 */
const VolumeAlgorithmDropdown: FC<Props & L10nProps> = ({
  content, language, onSelect,
}) => {
  const type: T.VolumeCalcMethod = content.info.calculatedVolume.calculation.type;
  const [dropdown, setDropdown] = useState<State>({
    volumeAlgorithm: undefined,
    volumeElevation: 0,
  });

  const prevContent = usePrevProps<T.VolumeContent>(content);

  useEffect(() => {
    if (
      type === T.VolumeCalcMethod.DESIGN ||
      type === T.VolumeCalcMethod.SURVEY
    ) {
      setDropdown({
        volumeAlgorithm: undefined,
        volumeElevation: 0,
      });
    } else {
      setDropdown({
        ...getAlgorithmElevation(content),
      });
    }
  }, []);

  const handleDropdownClick: (option: DropdownOption) => void = (option) => {
    const volumeAlgorithm: T.BasicCalcBasePlane = option.value as T.BasicCalcBasePlane;
    setDropdown({ ...dropdown, volumeAlgorithm });
    onSelect(volumeAlgorithm);
  };

  useEffect(() => {
    if (prevContent) {
      const prevVolume: T.VolumeContent['info']['calculatedVolume'] =
      prevContent.info.calculatedVolume;
      const currVolume: T.VolumeContent['info']['calculatedVolume'] =
      content.info.calculatedVolume;
      if (
        !_.isEqual(prevVolume, currVolume) &&
      (
        !_.isEqual(prevVolume.calculation.volumeAlgorithm, currVolume.calculation.volumeAlgorithm) ||
        !_.isEqual(prevVolume.calculation.volumeElevation, currVolume.calculation.volumeElevation)
      )
      ) {
        setDropdown({
          ...getAlgorithmElevation(content),
        });
      }
    }
  });

  const options: Array<DropdownOption> =
    volumeAlgorithms.map((volAlgorithm) => ({
      leftText: volumeAlgorithmLabel(volAlgorithm, language),
      value: volAlgorithm,
      tutorial: getVolumeAlgoTutorialProps(volAlgorithm, language),
    }));

  return (
    <Root>
      <Dropdown
        mainButtonStyle={dropdownMainButtonStyle}
        value={dropdown.volumeAlgorithm}
        placeHolder={l10n(Text.placeholder, language)}
        options={options}
        zIndex={1}
        onClick={handleDropdownClick}
        height={'112px'}
        menuItemHeight={'34px'}
        itemStyle={{ justifyContent: 'left' }}
      />
    </Root>
  );
};

export default withL10n(VolumeAlgorithmDropdown);

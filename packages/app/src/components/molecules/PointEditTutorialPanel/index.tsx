import React, { FC, ReactNode, memo, useEffect, useState } from 'react';

import { CSSObject } from 'styled-components';

import TutorialPanel from '^/components/atoms/TutorialPanel';
import TutorialPanelContent from '^/components/atoms/TutorialPanelContent';

import AddPoint from '^/assets/icons/tutorial-illustration-add-a-point.png';
import DeletePoint from '^/assets/icons/tutorial-illustration-delete-a-point.png';

import { UseState } from '^/hooks';
import { l10n } from '^/utilities/l10n';
import { arePropsEqual } from '^/utilities/react-util';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import * as T from '^/types';

import Text from './text';

const tutorialPanelStyle: CSSObject = {
  position: 'absolute',
  left: '50%',
  top: '62.4%',
  transform: 'translate(-50%, 0)',
  zIndex: 200,
};

export interface Props {
  readonly isPointEditTutorialPanelShown?: boolean;
  readonly isEditable?: boolean;
  readonly projectId?: T.Project['id'];
  onClosePointEditTutorialPanel(
    isPointEditTutorialPanelShown: NonNullable<T.UserConfig['isPointEditTutorialPanelShown']>,
  ): void;
}

const PointEditTutorialPanel: FC<Props & L10nProps> = ({
  language, onClosePointEditTutorialPanel, isPointEditTutorialPanelShown,
  isEditable, projectId,
}) => {
  const [isChecked, setIsChecked]: UseState<boolean> = useState(false);
  const [isClosedByUser, setIsClosedByUser]: UseState<boolean> = useState(false);

  const handleCheck: () => void = () => setIsChecked((prevIsChecked: boolean) => !prevIsChecked);
  const handleClose: () => void = () => {
    if (projectId !== undefined && isChecked) {
      onClosePointEditTutorialPanel(false);
    } else if (!isChecked) {
      setIsClosedByUser(() => true);
    }
  };

  const tutorialPanelContents: Array<ReactNode> =
    [{
      heading: l10n(Text.addPoint.heading, language),
      explanation: l10n(Text.addPoint.explanation, language),
      image: AddPoint,
    },
    {
      heading: l10n(Text.deletePoint.heading, language),
      explanation: l10n(Text.deletePoint.explanation, language),
      image: DeletePoint,
    }].map((props, idx) => () => <TutorialPanelContent {...props} key={`tutorial-panel-${idx}`} />);

  useEffect(() => {
    setIsClosedByUser(!isEditable);
  }, [isEditable]);

  return (isPointEditTutorialPanelShown && isEditable && !isClosedByUser) ? (
    <TutorialPanel
      tutorialPanelStyle={tutorialPanelStyle}
      onCloseClick={handleClose}
      onChange={handleCheck}
      checked={isChecked}
      label={l10n(Text.checkboxMessage, language)}
    >
      {tutorialPanelContents}
    </TutorialPanel>
  ) : null;
};

export default memo(withL10n(PointEditTutorialPanel), arePropsEqual);

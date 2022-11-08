import React, { ComponentType, FC, Fragment, ReactNode, memo } from 'react';
import styled, { CSSObject } from 'styled-components';

import DDMCheckBox from '^/components/atoms/DDMCheckBox';

import palette from '^/constants/palette';

import { arePropsEqual } from '^/utilities/react-util';

interface BackgroundProps {
  backgroundStyle?: CSSObject;
}

const Background = styled.div<BackgroundProps>({
  width: '683.6px',
  height: '265px',
  borderRadius: '5px',
  backgroundColor: palette.panelLight.toString(),
}, ({ backgroundStyle }) => ({
  ...backgroundStyle,
}));

const UpperOptionBar = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '17px 20px 0 0',
});

const MainContent = styled.div({
  display: 'flex',
  padding: '4.9px 13.9px 16px 34.8px',

  '&': {
    // The style of heading of the second tutorialContent (nth-child(2) is the divider)
    '> div:nth-child(3) > h2': {
      paddingLeft: '23px',
    },
  },
});

const CloseIcon = styled.i.attrs({
  className: 'fa fa-times',
  'data-testid': 'tutorialpanel-closeicon',
})({
  fontSize: '15px',
  cursor: 'pointer',
  color: palette.gray.toString(),
});

const DDMCheckBoxWrapper = styled.div({
  padding: '0 0 0 23.6px',
});

const Divider = styled.div.attrs({
  'data-testid': 'tutorialpanel-divider',
})({
  width: '1px',
  height: '176px',
  margin: '0 9.4px 0 17.8px',
  backgroundColor: palette.borderGray.toString(),
});

const labelStyle: CSSObject = {
  fontWeight: 'bold',
  fontSize: '13px',
  color: palette.textGray.toString() ,
};

export interface Props {
  tutorialPanelStyle?: CSSObject;
  checked: boolean;
  children: Array<ReactNode>;
  label: string | ReactNode;
  onCloseClick(): void;
  onChange(checked: boolean): void;
}

const TutorialPanel: FC<Props> =
  ({ onCloseClick, onChange, checked, label, children, tutorialPanelStyle }) => {
    const tutorialContentsWithBorder: ReactNode = children.map(
      (Child: ComponentType<{key: string}>, idx: number) =>
        idx !== 0 ?
          <Child key={`tutorial-contents-with-border-${idx}`} /> :
          <Fragment key={`tutorial-contents-with-border-fragment-${idx}`}>
            <Child key={`tutorial-contents-with-border-${idx}`} />
            <Divider key={`tutorial-contents-with-border-divider-${idx}`} />
          </Fragment>,
    );

    return (
      <Background backgroundStyle={tutorialPanelStyle}>
        <UpperOptionBar>
          <CloseIcon onClick={onCloseClick} />
        </UpperOptionBar>
        <MainContent>
          {tutorialContentsWithBorder}
        </MainContent>
        <DDMCheckBoxWrapper>
          <DDMCheckBox
            color={palette.textLight}
            labelStyle={labelStyle}
            label={label}
            onChange={onChange}
            checked={checked}
          />
        </DDMCheckBoxWrapper>
      </Background>
    );
  };

export default memo(TutorialPanel, arePropsEqual);

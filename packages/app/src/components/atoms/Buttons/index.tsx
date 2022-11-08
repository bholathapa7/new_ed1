/* istanbul ignore file: only styled components */
import Color from 'color';
import React, { FC, MouseEventHandler } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

export interface BaseButtonProps {
  customColor?: string;
  isDisabled?: boolean;
}


export const SubmitButton = styled.button({
  width: '212px',
  height: '33px',
  borderRadius: '6px',
  backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),

  color: palette.buttonFontColor.toString(),
  fontSize: '11px',
  fontWeight: 500,

  cursor: 'pointer',
});

export const BaseButton = styled.button<BaseButtonProps>(({ isDisabled }) => ({
  width: '120px',
  height: '48px',
  borderRadius: '6px',

  fontSize: '15px',
  fontWeight: 'bold',

  cursor: isDisabled ? 'default' : 'pointer',
  opacity: isDisabled ? '0.6' : '1',
}));

/**
 * Confirm button takes in a custom color prop.
 * Ideally this would not be the case since buttons should follow the DS palette.
 * However, in the customized plan login, user can set their own color.
 */
export const ConfirmButton = styled(BaseButton)(({ customColor, isDisabled }) => {
  if (customColor) {
    const colorInstance: Color = new Color(customColor);

    return {
      backgroundColor: colorInstance.toString(),
      color: palette.white.toString(),

      ':hover': isDisabled ? undefined : {
        // eslint-disable-next-line no-magic-numbers
        backgroundColor: colorInstance.lighten(0.2).toString(),
      },
    };
  }

  return {
    backgroundColor: 'var(--color-theme-primary)',
    color: palette.white.toString(),

    ':hover': isDisabled ? undefined : {
      backgroundColor: 'var(--color-theme-primary-lightest)',
    },
  };
});

export const DeleteButton = styled(BaseButton)(({ isDisabled }) => ({
  backgroundColor: palette.error.toString(),
  color: palette.white.toString(),
  ':hover': isDisabled ? undefined : {
    // eslint-disable-next-line no-magic-numbers
    backgroundColor: palette.error.lighten(0.1).toString(),
  },
}));

export const CancelButton = styled(BaseButton)(({ isDisabled }) => ({
  backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
  color: palette.buttonFontColor.toString(),
  ':hover': isDisabled ? undefined : {
    backgroundColor: palette.UploadPopup.hoverGray.toString(),
  },

  ':disabled': {
    color: palette.disabledFont.toString(),
    backgroundColor: palette.iconDisabled.toString(),
  },
}));

/**
 * According to mockup https://www.figma.com/file/JV8evx9HcLsfKGrJjLhdH3/Done_Plan?node-id=0%3A1
 * The buttons on the customized login/signup/password page is different from the normal login page.
 * Ideally, normal or customized login page should use the same button, but
 * we haven't got into that phase yet. For now, having these two buttons will do.
 */
export const NonAuthNormalConfirmButton = styled(ConfirmButton)({
  width: '160px',
  height: '58px',
  fontSize: '16px',
  margin: 'auto',
  marginTop: '30px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const NonAuthPlanConfirmButton = styled(ConfirmButton)({
  width: '100%',
  height: '37px',
  fontSize: '13px',
  marginTop: '30px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

type Props = BaseButtonProps & {
  disabled?: boolean;
  onClick?: MouseEventHandler;
};

export const NonAuthConfirmButton: FC<Props> = (props) => props.customColor
  ? <NonAuthPlanConfirmButton {...props} />
  : <NonAuthNormalConfirmButton {...props} />;



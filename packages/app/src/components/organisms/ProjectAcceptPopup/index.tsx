import React, { FC, Fragment, ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import ProjectPreview from '^/components/molecules/ProjectPreview';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const Wrapper = styled.ul({
  display: 'flex',
  flexDirection: 'column',

  boxSizing: 'border-box',
  width: '640px',

  listStyle: 'none',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '360px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: '340px',
  },
});

const ItemHeader = styled.li({
  display: 'flex',
  direction: 'ltr',
  alignItems: 'center',

  flexShrink: 0,
  boxSizing: 'border-box',
  width: '100%',
  padding: '30px',

  cursor: 'pointer',

  ':not(:first-of-type)': {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: palette.border.toString(),
  },
});
ItemHeader.displayName = 'ItemHeader';

interface SelectedProp {
  readonly selected: boolean;
}
const Title = styled.h2<SelectedProp>({
  flexGrow: 1,
  color: palette.textBlack.toString(),
}, (props) => props.selected ? {
  fontSize: '18px',
  lineHeight: '28px',
  fontWeight: 'bold',
  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '15px',
  },
} : {
  fontSize: '15px',
  lineHeight: '25px',
  fontWeight: 500,
});

const Caret = styled.i.attrs((props: SelectedProp) => ({
  className: `fa fa-chevron-${(props.selected ? 'up' : 'down')}`,
}))<SelectedProp>({
  flexShrink: 0,
  marginLeft: '20px',

  fontSize: '18px',
  color: palette.icon.toString(),
});

const ItemBody = styled.li({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  paddingLeft: '30px',
  paddingRight: '30px',
  paddingBottom: '50px',
});

const Description = styled.h3({
  marginBottom: '35px',

  fontSize: '15px',
  lineHeight: '25px',
  fontWeight: 'normal',
  color: palette.textGray.toString(),

  [MediaQuery[T.Device.MOBILE_S]]: {
    fontSize: '13px',
  },
});

const ButtonWrapper = styled.div({
  width: '261px',
  marginTop: '20px',
});

const ConfirmButton = styled(RawConfirmButton)({
  width: '100%',
});

const backgroundAlpha: number = 0.45;

export interface Props {
  readonly zIndex: number;
  readonly projects: Array<T.Project>;
  onClose(): void;
  onDecide(id: number): void;
}

const ProjectAcceptPopup: FC<Props & L10nProps> = ({
  projects, language, zIndex, onClose, onDecide,
}) => {
  const [selected, setSelected] = useState<number | undefined>(projects.length !== 0 ?
    projects[0].id : undefined);

  useEffect(() => {
    if (projects.length === 0) {
      onClose();
    }

    if (selected !== undefined && projects.every((project) => project.id !== selected)) {
      setSelected(projects[0].id);
    }
  }, [projects.length]);

  const handleItemClick = (id: T.Project['id']): void => {
    if (selected === id) {
      setSelected(undefined);
    } else {
      setSelected(id);
    }
  };

  const projectToItem: (project: T.Project) => ReactNode = (project) => {
    const handleClick: () => void = () => handleItemClick(project.id);
    const handleAccept: () => void = () => onDecide(project.id);
    const selectedValue: boolean = selected === project.id;
    const headerText: string =
      `${project.owner.email} ${l10n(Text.description[0], language)} ` +
      `[${project.title}] ${l10n(Text.description[1], language)}`;

    const header: ReactNode = (
      <ItemHeader onClick={handleClick}>
        <Title selected={selectedValue}>
          {headerText}
        </Title>
        <Caret selected={selectedValue} />
      </ItemHeader>
    );
    const body: ReactNode =
      selected ? (
        <ItemBody>
          <Description>{project.description}</Description>
          <ProjectPreview project={project} />
          <ButtonWrapper>
            <ConfirmButton onClick={handleAccept}>
              {l10n(Text.accept, language)}
            </ConfirmButton>
          </ButtonWrapper>
        </ItemBody>
      ) : undefined;

    return (
      <Fragment key={project.id}>
        {header}
        {body}
      </Fragment>
    );
  };

  return (
    <Popup
      title={l10n(Text.title, language)}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
    >
      <Wrapper>
        {projects.map(projectToItem)}
      </Wrapper>
    </Popup>
  );
};

export default withL10n(ProjectAcceptPopup);

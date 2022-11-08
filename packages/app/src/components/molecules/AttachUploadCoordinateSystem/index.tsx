import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import CoordinateSystemDropdown, { Props as DropDownProps } from '^/components/molecules/CoordinateSystemDropdown';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { defaultCoordinateSystem } from '^/utilities/coordinate-util';
import Text from './text';

const TextLabel = styled.p({
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '10px',

  color: dsPalette.title.toString(),
});

export interface Props {
  coordinateSystem: T.CoordinateSystem | undefined;
  setCoordinateSystem: DropDownProps['onSelect'];
}

export const AttachUploadCoordinateSystem: FC<Props> = ({
  coordinateSystem, setCoordinateSystem,
}) => {
  const { Projects: { projects: { byId: projects } }, Pages: { Contents: { projectId } } }: T.State = useSelector((state: T.State) => state);
  const [l10n]: UseL10n = useL10n();

  useEffect(() => {
    if (projectId === undefined) {
      setCoordinateSystem(defaultCoordinateSystem);

      return;
    }

    const projectCoordinateSystem: T.CoordinateSystem | undefined = projects[projectId].coordinateSystem;

    if (projectCoordinateSystem === undefined) {
      setCoordinateSystem(defaultCoordinateSystem);
    } else {
      setCoordinateSystem(projectCoordinateSystem);
    }
  }, []);

  const onSelect: (coordinateSystem: T.CoordinateSystem) => void = (value) => {
    setCoordinateSystem(value);
  };

  return (
    <>
      <TextLabel>{l10n(Text.overlayCoordinateSystem)}</TextLabel>
      <CoordinateSystemDropdown
        value={coordinateSystem}
        onSelect={onSelect}
      />
    </>
  );
};

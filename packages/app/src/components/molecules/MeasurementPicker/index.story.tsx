import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import { getUserFeaturePermission } from '^/utilities/withFeatureToggle';

import MeasurementPicker, { Props } from '.';

storiesOf('Molecules|AnnotationPicker', module)
  .add('default-select-false', () => {
    const props: Props = {
      role: T.PermissionRole.ADMIN,
      onMeasurementContentTypeSelect: () => undefined,
      isAvailableSBVC: true,
      isDesignDxfExist: true,
      isIn3D: false,
      shouldShowESSWorkTool: false,
      userFeaturePermission: getUserFeaturePermission(T.Feature.DDM),
    };

    return (
      <MeasurementPicker {...props} />
    );
  });

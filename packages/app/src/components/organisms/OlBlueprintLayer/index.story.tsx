import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import Map from 'ol/Map';
import React from 'react';

import OlBlueprintLayer, { Props } from './';

import * as M from '^/store/Mock';
import * as T from '^/types';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';


storiesOf('Organisms|OlBlueprintLayer', module)
  .add('default',
    () => {
      const mapTarget: HTMLDivElement = document.createElement('div');
      document.body.appendChild(mapTarget);
      const map: Map = new Map({
        target: mapTarget,
      });
      const createProps: () => Props = () => ({
        content: M.sampleContentFromType(T.ContentType.BLUEPRINT_PDF) as T.BlueprintPDFContent,
        edit: false,
        isAligning: false,
        zIndex: 0,
        updatePoint: action('updatePoint'),
      });

      return (
        <TestOlMapProvider value={map}>
          <OlBlueprintLayer {...createProps()} />
        </TestOlMapProvider>
      );
    });

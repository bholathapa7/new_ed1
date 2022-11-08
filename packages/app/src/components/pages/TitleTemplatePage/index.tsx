import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { CSSObject } from 'styled-components';

import * as T from '^/types';

import CustomTitleTemplatePage from './custom';
import SimpleTitleTemplatePage from './simple';

// eslint-disable-next-line
export interface Props {
  readonly title?: string;
  readonly descriptionStyle?: CSSObject;
  // In most cases, the page doesn't need to be scrollable and content is centered vertically.
  // Other cases, content is long and scrollable, therefore
  // the logic needs to be set for hiding the vertical logos when necessary.
  readonly isScrollable?: boolean;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc finding password page
 */
const TitleTemplatePage: FC<Props> = (props) => {
  const needsCustomization: boolean = useSelector((state: T.State) => !!state.PlanConfig.config?.slug);

  return needsCustomization
    ? <CustomTitleTemplatePage {...props} />
    : <SimpleTitleTemplatePage {...props} />;
};

export default TitleTemplatePage;

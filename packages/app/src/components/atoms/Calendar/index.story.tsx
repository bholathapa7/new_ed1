import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import { Calendar, getDisabledTooltip } from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
/* eslint-disable no-magic-numbers */
const Wrapper = styled.div({
  width: '210px',
});

const getDisabledCellStyle: (text: string) => CSSObject = (text) => ({
  ':hover': {
    '::after': {
      ...getDisabledTooltip(text),
      bottom: 'calc(-50% + 3px)',
    },
  },
});

storiesOf('Atoms|Calendar', module)
  .add('SELECTED_DATE_PROPS_AVAILABLE_DAYS', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <Wrapper>
          <Calendar
            onDayClick={action('dayclick')}
            calendarStyle={{
              cellStyle: {
                width: '30px',
                height: '30px',
              },
            }}
            defaultDate={new Date(2020, 1)}
            enabledDates={[
              new Date(2020, 1, 2),
              new Date(2020, 1, 3),
              new Date(2020, 4, 3),
            ]}
            calendarType={T.CalendarType.SELECTED_DATE}
          />
        </Wrapper>
      </Provider>
    );
  }).add('FROM_TODAY_UNTIL_2100', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <Wrapper>
          <Calendar
            onDayClick={action('dayclick')}
            calendarStyle={{
              cellStyle: {
                width: '30px',
                height: '30px',
              },
            }}
            defaultDate={new Date(2020, 1)}
            calendarType={T.CalendarType.FROM_TODAY_UNTIL_2100}
          />
        </Wrapper>
      </Provider>
    );
  }).add('FROM_2010_UNTIL_TODAY', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <Wrapper>
          <Calendar
            onDayClick={action('dayclick')}
            calendarStyle={{
              cellStyle: {
                width: '30px',
                height: '30px',
              },
              disabledCellStyle: getDisabledCellStyle('지도 없음'),
            }}
            defaultDate={new Date(2020, 1)}
            calendarType={T.CalendarType.FROM_2010_UNTIL_TODAY}
            disabledDates={[new Date(2020, 1, 3)]}
          />
        </Wrapper>
      </Provider>
    );
  }).add('FROM_2010_UNTIL_TODAY EN_US', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

    return (
      <Provider store={store}>
        <Wrapper>
          <Calendar
            onDayClick={action('dayclick')}
            calendarStyle={{
              cellStyle: {
                width: '30px',
                height: '30px',
              },
              disabledCellStyle: getDisabledCellStyle('No Map'),
            }}
            defaultDate={new Date(2020, 1)}
            calendarType={T.CalendarType.FROM_2010_UNTIL_TODAY}
            disabledDates={[new Date(2020, 1, 3)]}
          />
        </Wrapper>
      </Provider>
    );
  });

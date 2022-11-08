import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as M from '^/store/Mock';

import ContentImagePopup, {
  DispatchProps,
  OwnProps,
  StateProps,
  mapDispatchToProps,
  mapStateToProps,
} from './';

describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
    dispatchProps = mapDispatchToProps(dispatch);
  });

  it('should call dispatch when call onClick', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onClick(0);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call onClose', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onClose();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Attachments' | 'ESSAttachments' | 'Pages' | 'Projects'>;
  const mockState: MockState = {
    Attachments: M.mockAttachments,
    ESSAttachments: M.mockESSAttachments,
    Pages: M.mockPages,
    Projects: M.mockProjects,
  };
  let stateProps: StateProps;

  it('should have same timeoffset with original state', () => {
    stateProps = mapStateToProps(mockState);
    expect(stateProps.timezoneOffset).toBe(mockState.Pages.Common.timezoneOffset);
  });

  it('should have attachments only with current content id', () => {
    stateProps = mapStateToProps(mockState);
    stateProps.attachments.forEach((attachment) => {
      expect(M.mockAttachments.attachments.byId[attachment.id].contentId).toBe(
        M.mockPages.Contents.imageViewerStatus.contentId,
      );
    });
  });
});

describe('Connected ContentImagePopup', () => {
  const props: OwnProps = {
    zIndex: 0,
  };
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should not emit an error during rendering', () => {
    expect(() => {
      ReactTesting.render(
        <Provider store={store}>
          <ContentImagePopup {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});

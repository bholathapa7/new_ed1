import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ContentSharePopup, { Props } from './';

describe('ContentSharePopup', () => {
  const createProps: () => Props = () => ({
    // eslint-disable-next-line no-magic-numbers
    lastSelectedScreenDate: new Date(Date.UTC(2018, 2, 3)),
    timezoneOffset: 540,
    selectedContentIds: [0, 1],
    shareToken: 'wegower3210412e210fwe',
    navbarLogoUrl: 'https://test.angelswing.io/static/media/logo.e5ee7d3d.png',
    zIndex: 12,
    // eslint-disable-next-line no-magic-numbers
    cameraPosition: [123, 37],
    zoomLevel: 16,
    postShareStatus: T.APIStatus.IDLE,
    postShareRequest: jest.fn(),
    cancelShareRequest: jest.fn(),
    onClose: jest.fn(),
  });
  let store: DDMMockStore;
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ContentSharePopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it.skip('should copy share link to clipboard on copy button click in evergreen browsers', () => {
    const mockCopyEvent: ClipboardEvent = {
      preventDefault: jest.fn(),
      clipboardData: {
        setData: jest.fn(),
      },
    } as any;
    (document as any).execCommand = jest.fn();
    jest.spyOn(document, 'addEventListener')
      .mockImplementation((_event, callback: EventListener) => {
        callback(mockCopyEvent);
      });

    ReactTesting.fireEvent.click(renderResult.getByTestId('contentsharepopup-copybutton'));
    expect(document.execCommand).toHaveBeenCalledTimes(1);
    expect(document.execCommand).toHaveBeenLastCalledWith('copy');
    if (mockCopyEvent.clipboardData) {
      expect(mockCopyEvent.clipboardData.setData).toHaveBeenCalledTimes(1);
      expect(mockCopyEvent.clipboardData.setData)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .toHaveBeenLastCalledWith('text/plain', expect.stringContaining(props.shareToken!));
    }
  });

  it.skip('should copy share link to clipboard on copy button click in IE', () => {
    (window.clipboardData as any) = {
      setData: jest.fn(),
    };

    ReactTesting.fireEvent.click(renderResult.getByTestId('contentsharepopup-copybutton'));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(window.clipboardData!.setData).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(window.clipboardData!.setData)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .toHaveBeenLastCalledWith('Text', expect.stringContaining(props.shareToken!));
  });

  it.skip('should change when the user clicks copy button', () => {
    renderResult.rerender(
      <Provider store={store}>
        <ContentSharePopup {...props} />
      </Provider>,
    );

    expect(renderResult.container.querySelectorAll('button')).toHaveLength(2);
    ReactTesting.fireEvent.click(renderResult.getByTestId('contentsharepopup-copybutton'));
    expect(renderResult.getByTestId('contentsharepopup-copybutton'))
      .toHaveStyleRule('pointer-events', 'none');
    expect(renderResult.getByTestId('contentsharepopup-inputurllink'))
      .toBe(document.activeElement);

    ReactTesting.fireEvent.click(renderResult.getByTestId('contentsharepopup-copyembedbutton'));
    expect(renderResult.getByTestId('contentsharepopup-copyembedbutton'))
      .toHaveStyleRule('pointer-events', 'none');
    expect(renderResult.getByTestId('contentsharepopup-textareaembedlink'))
      .toBe(document.activeElement);
  });
});

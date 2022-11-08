import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import DOMEventHandler, { Props } from './';

describe('DOMEventHandler', () => {
  const createProps: () => Props = () => ({
    target: document.body,
    type: 'click',
    onEvent: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <DOMEventHandler {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should attach the handler of the type to the target', () => {
    expect(props.onEvent).toHaveBeenCalledTimes(0);
    document.body.dispatchEvent(new Event(props.type));
    expect(props.onEvent).toHaveBeenCalledTimes(1);
  });

  it('should accept same props twice without error', () => {
    expect(() => {
      renderResult.rerender(
        <DOMEventHandler {...props} />,
      );
    }).not.toThrowError();
  });

  it('should remove old handler when new props has different target', () => {
    renderResult.rerender(
      <DOMEventHandler {...props} target={document.head} />,
    );
    expect(props.onEvent).toHaveBeenCalledTimes(0);
    document.body.dispatchEvent(new Event(props.type));
    expect(props.onEvent).toHaveBeenCalledTimes(0);
  });

  it('should attach new handler when new props has different target', () => {
    renderResult.rerender(
      <DOMEventHandler {...props} target={document.head} />,
    );
    expect(props.onEvent).toHaveBeenCalledTimes(0);
    document.head.dispatchEvent(new Event(props.type));
    expect(props.onEvent).toHaveBeenCalledTimes(1);
  });

  it('should remove old handler when new props has different type', () => {
    renderResult.rerender(
      <DOMEventHandler {...props} type='focus' />,
    );
    expect(props.onEvent).toHaveBeenCalledTimes(0);
    document.body.dispatchEvent(new Event(props.type));
    expect(props.onEvent).toHaveBeenCalledTimes(0);
  });

  it('should attach new handler when new props has different type', () => {
    renderResult.rerender(
      <DOMEventHandler {...props} type='focus' />,
    );
    expect(props.onEvent).toHaveBeenCalledTimes(0);
    document.body.dispatchEvent(new Event('focus'));
    expect(props.onEvent).toHaveBeenCalledTimes(1);
  });

  it('should remove old handler when new props has different handler', () => {
    renderResult.rerender(
      <DOMEventHandler {...props} onEvent={jest.fn()} />,
    );
    expect(props.onEvent).toHaveBeenCalledTimes(0);
    document.body.dispatchEvent(new Event(props.type));
    expect(props.onEvent).toHaveBeenCalledTimes(0);
  });

  it('should attach new handler when new props has different handler', () => {
    const newHandler: jest.Mock = jest.fn();
    renderResult.rerender(
      <DOMEventHandler {...props} onEvent={newHandler} />,
    );
    expect(newHandler).toHaveBeenCalledTimes(0);
    document.body.dispatchEvent(new Event(props.type));
    expect(newHandler).toHaveBeenCalledTimes(1);
  });

  it('should detach the handler when the component is unmounted', () => {
    renderResult.unmount();
    expect(props.onEvent).toHaveBeenCalledTimes(0);
    document.body.dispatchEvent(new Event(props.type));
    expect(props.onEvent).toHaveBeenCalledTimes(0);
  });
});

import download from './download';

describe('download', () => {
  const url: string = 'mock_url';

  it('should open window when usePopup is true', () => {
    window.open = jest.fn();
    expect(window.open).not.toBeCalled();
    download(url, true, true);
    expect(window.open).toBeCalledWith(url);
  });

  it('should make correct temp document', () => {
    const createElement: jest.SpyInstance<HTMLElement> = jest.spyOn(document, 'createElement');

    expect(createElement).not.toBeCalled();
    download(url, false, false);
    expect(createElement.mock.results[0]).not.toBeNull();

    const a: HTMLAnchorElement = createElement.mock.results[0].value;
    expect(a.href).not.toBeNull();
    expect(a.href.includes(url)).toBe(true);
  });
});

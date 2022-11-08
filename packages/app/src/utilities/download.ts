/**
 * @author Junyoung Clare Jang
 * @desc Fri Jan 19 22:02:25 2018 UTC
 * This code depends on `window` object.
 * It can make problems with SSR.
 * @todo remove istanbul ignore (add tests)
 */
/* istanbul ignore next */
const download: (url: string, usePopup: boolean, useBlob: boolean, name?: string) => void = (
  url, usePopup, useBlob, name,
) => {
  if (usePopup) {
    window.open(url);

    return;
  }

  const fileName: string = name !== undefined ?
    name :
    url.substring(url.lastIndexOf('/') + 1).split('?')[0];

  const temp: HTMLAnchorElement = document.createElement('a');
  temp.href = url;

  /**
   * @desc Browser checks whether URL is valid or not
   */
  if (temp.href.indexOf(url) !== -1) {
    /**
     * @fixme `useBlob` cases could have performance issue.
     */
    if (useBlob) {
      /**
       * @desc Following code depends on `window`.
       */
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      /**
       * @desc DON'T CHANGE THE ORDER.
       * IE has bug with setting `responseType` and other properties.
       */
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.addEventListener('load', () => {
        if (window.navigator.msSaveOrOpenBlob !== undefined) {
          window.navigator.msSaveOrOpenBlob(xhr.response, fileName);
        } else {
          download(window.URL.createObjectURL(xhr.response), false, false, name);
        }
      });
      xhr.send();
    } else {
      temp.href = url;
      temp.download = fileName;
      temp.target = '_blank';
      temp.style.display = 'none';
      document.body.appendChild(temp);
      temp.click();
      document.body.removeChild(temp);
    }
  }
};
export default download;

declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    // eslint-disable-next-line constructor-super,@typescript-eslint/explicit-member-accessibility
    constructor() {}
  }

  export default WebpackWorker;
}

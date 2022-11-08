declare global {
  interface Window {
    ChannelIO: any;
    ChannelInitialized: boolean;
  }
}

const CHANNEL_CDN_URL = 'https://cdn.channel.io/plugin/ch-plugin-web.js';

const initializeChannel: () => void = () => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = CHANNEL_CDN_URL;
  const x = document.getElementsByTagName('script')[0];
  x.parentNode?.insertBefore(script, x);
};

export default (() => {
  if (!window.ChannelInitialized) {
    const ch: any = function () {
      ch.c(arguments);
    };
    ch.q = [];
    ch.c = (args: any) => {
      ch.q.push(args);
    };
    window.ChannelIO = ch;
    initializeChannel();
    window.ChannelInitialized = true;
  }

  return window.ChannelIO;
});

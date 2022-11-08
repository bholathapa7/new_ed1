import { Language } from '^/types';

export default {
  weekdaysShort: {
    [Language.KO_KR]: '일월화수목금토일'.split(''),
    [Language.EN_US]: 'SMTWTFS'.split(''),
  },
  /**
   * @desc React-daypicker uses attr tag with alt
   * Giving it as [''], it makes alt text hide
   */
  weekdaysLong: {
    [Language.KO_KR]: [''],
    [Language.EN_US]: [''],
  },
  year: {
    [Language.KO_KR]: '년',
    [Language.EN_US]: '',
  },
  month: {
    [Language.KO_KR]: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    [Language.EN_US]: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
};


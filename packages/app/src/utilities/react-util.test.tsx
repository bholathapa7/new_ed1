import {
  arePropsEqual, pluckNonFunctions,
} from './react-util';

describe('pluckNonFunctions', () => {
  let fullObj: object;
  let withoutFuncObj: object;
  let funcObj: object;

  beforeEach(() => {
    withoutFuncObj = {
      angelswing: 'inc',
      octopus: 'octopus',
      squid: '오징어',
      delicious: 'yes',
    };
    funcObj = {
      sayYo: () => 'sayYo',
      haha: (haha: string) => `haha${haha}`,
    };
    fullObj = {
      ...withoutFuncObj,
      ...funcObj,
    };
  });

  it('removes functions from an object', () => {
    ['sayYo', 'haha'].forEach(expect(pluckNonFunctions(fullObj)).not.toHaveProperty);
  });

  it('does not remove object properties other than functions', () => {
    expect(pluckNonFunctions(fullObj)).toMatchObject(withoutFuncObj);
  });
});


describe('arePropsEqual', () => {
  let veryNested0: object;
  let veryNested1: object;

  beforeEach(() => {
    veryNested0 = {
      color: 'white',
      delicious: false,
      price: 1,
      soldAt: [
        'Seoul', 'Busan', 'PoHang',
      ],
      idk: {
        idk: 'idk',
        idkArr: ['arr', 1, 'idk'],
      },
      spraySquidInk: () => '검정오징어먹물꿀맛~',
      swim: () => 'I am good at swimming~',
    };

    // Not using ... operator because there are nested properties
    veryNested1 = {
      color: 'white',
      delicious: false,
      price: 1,
      soldAt: [
        'Seoul', 'Busan', 'PoHang',
      ],
      idk: {
        idk: 'idk',
        idkArr: ['arr', 1, 'idk'],
      },
      spraySquidInk: () => '검정오징어먹물꿀맛~',
      swim: () => 'I am good at swimming~',
    };
  });

  it('returns true if all nested object properties are the same', () => {
    expect(arePropsEqual(veryNested0, veryNested1)).toEqual(true);
  });

  it('returns false if some properties are different', () => {
    expect(arePropsEqual({
      ...veryNested0,
      idk: {
        idk: 'DIFFERENTDFNIFEIFIENIENFEI',
        idkArr: ['arr', 1, 'idk'],
      },
    }, veryNested1)).toEqual(false);
  });

  it('ignores functions when comparing', () => {
    const mightBeDifferent: object = {
      ...veryNested0,
      swim: () => 'asdfadfadsfadsfasf',
      spraySquidInk: () => 'squid ink past is delicious',
    };
    expect(arePropsEqual(mightBeDifferent, veryNested1)).toEqual(true);
  });
});

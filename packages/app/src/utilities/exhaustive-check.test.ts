import { exhaustiveCheck } from './exhaustive-check';

type Fruit = 'banana' | 'orange';

const makeDessert: (fruit: Fruit) => void = (fruit) => {
  // eslint-disable-next-line default-case
  switch (fruit) {
    case 'banana':
      return 'Banana Shake';
    case 'orange':
      return 'Orange Juice';
  }
  exhaustiveCheck(fruit);
};

describe('exhaustiveCheck', () => {
  it('should not throw error when all options have been exhausted', () => {
    expect(() => makeDessert('banana')).not.toThrowError();
    expect(() => makeDessert('orange')).not.toThrowError();
  });

  it('should throw error when some unknown option is supplied', () => {
    expect(() => makeDessert('squid' as Fruit)).toThrowError();
  });
});

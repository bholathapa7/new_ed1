import {
  ValidationResult,
  Validator,
  compose,
  condition,
  maxLength,
  minLength,
  pattern,
  required,
} from './validators';

describe('condition function', () => {
  let condFn: jest.Mock<boolean>;
  let validator: Validator;

  beforeEach(() => {
    condFn = jest.fn();
    validator = condition(condFn);
  });

  it('should call its condition function once for each calling of validator', () => {
    expect(condFn).toHaveBeenCalledTimes(0);

    let called: number = 0;
    const valueSequence: ReadonlyArray<string> = [
      '',
      'gweg',
      '464634',
      '09we4fw',
      '@!%!@%)@^#',
    ];

    for (const value of valueSequence) {
      called++;
      validator(value);
      expect(condFn).toHaveBeenCalledTimes(called);
    }
  });

  it('should return non-valid result when fails', () => {
    condFn.mockReturnValue(false);

    let result: ValidationResult;
    const valueSequence: ReadonlyArray<string> = [
      '',
      'pqwefqw',
      '158901231',
      'tf9ve0gu305r03',
      '@#)!@$)!@#',
    ];

    for (const value of valueSequence) {
      result = validator(value);
      expect(result.valid).toBe(false);
    }
  });

  it('should return single error when fails', () => {
    condFn.mockReturnValue(false);

    let result: ValidationResult;
    const valueSequence: ReadonlyArray<string> = [
      '',
      'bjrroger',
      '69239034',
      'h404iy43g01',
      '(!@$#@&(%)_(',
    ];

    for (const value of valueSequence) {
      result = validator(value);
      expect(result.errors.length).toBe(1);
    }
  });

  it('should return error corresponding to its name when fails without set name', () => {
    condFn.mockReturnValue(false);

    let result: ValidationResult;
    const valueSequence: ReadonlyArray<string> = [
      '',
      'wepoqergxc',
      '64203',
      '9vaza0tfq',
      '!%)!@-@!%.,',
    ];

    for (const value of valueSequence) {
      result = validator(value);
      expect(result.errors.includes('condition')).toBe(true);
    }
  });

  it('should return error corresponding to its set name when fails', () => {
    condFn.mockReturnValue(false);
    validator = condition(condFn, 'other name');

    let result: ValidationResult;
    const valueSequence: ReadonlyArray<string> = [
      '',
      'zpbbmnvllie',
      '509231',
      '120cqw01qpwr912',
      '!@#(><!@$:"',
    ];

    for (const value of valueSequence) {
      result = validator(value);
      expect(result.errors.includes('other name')).toBe(true);
    }
  });

  it('should return valid result when succeeds', () => {
    condFn.mockReturnValue(true);

    let result: ValidationResult;
    const valueSequence: ReadonlyArray<string> = [
      '',
      'qweodas',
      '43905234',
      'gweugj02gj023',
      '^(@)$#$@#!@#&*)^',
    ];

    for (const value of valueSequence) {
      result = validator(value);
      expect(result.valid).toBe(true);
    }
  });

  it('should return zero errors when succeeds', () => {
    condFn.mockReturnValue(true);

    let result: ValidationResult;
    const valueSequence: ReadonlyArray<string> = [
      '',
      'ooqwgknlsffhg',
      '90512324t',
      'gh512foi1o24r0f',
      ')*(#@$!@%(@#)!@)',
    ];

    for (const value of valueSequence) {
      result = validator(value);
      expect(result.errors.length).toBe(0);
    }
  });
});

describe('maxLength function', () => {
  it('should return same result with condition function having less-than condtion', () => {
    let length: number = 5;
    let maxLengthValidator: Validator = maxLength(length);
    const maxLengthCondFn: jest.Mock<boolean> = jest.fn((value: string) => value.length <= length);
    const conditionValidator: Validator = condition(maxLengthCondFn, 'maxLength');

    const valueSequence: ReadonlyArray<string> = [
      '',
      'fefq',
      '1240910391203',
      '1a2',
      '@$!@$@!',
    ];

    for (const value of valueSequence) {
      expect(maxLengthValidator(value)).toEqual(conditionValidator(value));
    }

    // eslint-disable-next-line no-magic-numbers
    length = 8;
    maxLengthValidator = maxLength(length);

    for (const value of valueSequence) {
      expect(maxLengthValidator(value)).toEqual(conditionValidator(value));
    }
  });
});

describe('minLength function', () => {
  it('should return same result with condition function having greater-than condtion', () => {
    let length: number = 5;
    let minLengthValidator: Validator = minLength(length);
    const minLengthCondFn: jest.Mock<boolean> = jest.fn((value: string) => value.length >= length);
    const conditionValidator: Validator = condition(minLengthCondFn, 'minLength');

    const valueSequence: ReadonlyArray<string> = [
      '',
      'fefq',
      '1240910391203',
      '1a2',
      '@$!@$@!',
    ];

    for (const value of valueSequence) {
      expect(minLengthValidator(value)).toEqual(conditionValidator(value));
    }

    // eslint-disable-next-line no-magic-numbers
    length = 8;
    minLengthValidator = minLength(length);

    for (const value of valueSequence) {
      expect(minLengthValidator(value)).toEqual(conditionValidator(value));
    }
  });
});

describe('pattern function', () => {
  it('should test its argument regExp once and only once per check', () => {
    const regExp: RegExp = /^abc.*$/;
    const regExpSpy: jest.SpyInstance<boolean, [string]> =
      jest.spyOn(regExp, 'test');
    const patternValidator: Validator = pattern(regExp);

    const valueSequence: ReadonlyArray<string> = [
      '',
      'gwefwejvpq',
      '8732485',
      '8e053tkep',
      '^$#(#&&#)',
    ];
    let counter: number = 0;
    expect(regExpSpy).toHaveBeenCalledTimes(counter);

    for (const value of valueSequence) {
      counter++;
      patternValidator(value);
      expect(regExpSpy).toHaveBeenCalledTimes(counter);
    }
  });

  it('should test its argument regExp with the value of the check', () => {
    const regExp: RegExp = /^abc.*$/;
    const regExpSpy: jest.SpyInstance<boolean, [string]> =
      jest.spyOn(regExp, 'test');
    const patternValidator: Validator = pattern(regExp);

    const valueSequence: ReadonlyArray<string> = [
      '',
      'gwefwejvpq',
      '8732485',
      '8e053tkep',
      '^$#(#&&#)',
    ];

    for (const value of valueSequence) {
      patternValidator(value);
      expect(regExpSpy).lastCalledWith(value);
    }
  });

  it('should return same result with condition function having regExp test condition', () => {
    let regExp: RegExp = /[^0-9]*/;
    let patternValidator: Validator = pattern(regExp);
    const regExpCondFn: jest.Mock<boolean> = jest.fn((value: string) => regExp.test(value));
    const conditionValidator: Validator = condition(regExpCondFn, 'pattern');

    const valueSequence: ReadonlyArray<string> = [
      '',
      'wfiwe',
      '12321804213',
      'e1f1022310f0',
      '@$!@$@!',
    ];

    for (const value of valueSequence) {
      expect(patternValidator(value)).toEqual(conditionValidator(value));
    }

    regExp = /^[a-z].*[0-9]$/;
    patternValidator = pattern(regExp);

    for (const value of valueSequence) {
      expect(patternValidator(value)).toEqual(conditionValidator(value));
    }
  });
});

describe('required function', () => {
  it('should return same result with condition function having content-including condition', () => {
    const requiredValidator: Validator = required();
    const requiredCondFn: jest.Mock<boolean> = jest.fn((value: string) => value !== '');
    const conditionValidator: Validator = condition(requiredCondFn, 'required');

    const valueSequence: ReadonlyArray<string> = [
      '',
      'fefq',
      '1240910391203',
      '1a2',
      '@$!@$@!',
    ];

    for (const value of valueSequence) {
      expect(requiredValidator(value)).toEqual(conditionValidator(value));
    }
  });
});

describe('compose function', () => {
  it('should call all passed validators per check', () => {
    const validator0: jest.Mock<ValidationResult> = jest.fn();
    const validator1: jest.Mock<ValidationResult> = jest.fn();
    validator0.mockReturnValue({
      valid: false,
      errors: [],
    });
    validator1.mockReturnValue({
      valid: false,
      errors: [],
    });

    const composedValidator: Validator = compose(validator0, validator1);

    const valueSequence: ReadonlyArray<string> = [
      '',
      'qoemaz',
      '02385',
      'fe01md02f',
      '&(#@&%)',
    ];
    let counter: number = 0;

    expect(validator0).toHaveBeenCalledTimes(counter);
    expect(validator1).toHaveBeenCalledTimes(counter);

    for (const value of valueSequence) {
      counter++;
      composedValidator(value);
      expect(validator0).toHaveBeenCalledTimes(counter);
      expect(validator1).toHaveBeenCalledTimes(counter);
    }
  });

  it('should call all passed validators with the parameter of the check', () => {
    const validator0: jest.Mock<ValidationResult> = jest.fn();
    const validator1: jest.Mock<ValidationResult> = jest.fn();
    validator0.mockReturnValue({
      valid: false,
      errors: [],
    });
    validator1.mockReturnValue({
      valid: false,
      errors: [],
    });

    const composedValidator: Validator = compose(validator0, validator1);

    const valueSequence: ReadonlyArray<string> = [
      '',
      'qoemaz',
      '02385',
      'fe01md02f',
      '&(#@&%)',
    ];

    for (const value of valueSequence) {
      composedValidator(value);
      expect(validator0).lastCalledWith(value);
      expect(validator1).lastCalledWith(value);
    }
  });

  it('should return equivalent validator when pass it only', () => {
    const condFn: jest.Mock<boolean> = jest.fn();
    const validator: Validator = condition(condFn);
    const composedValidator: Validator = compose(validator);

    const valueSequence: ReadonlyArray<string> = [
      '',
      'fwejo',
      '1940124',
      'few02rf02',
      '!@%*!@)$',
    ];

    for (const value of valueSequence) {
      expect(composedValidator(value)).toEqual(validator(value));
    }
  });

  it('should return non-valid result when all passed validators fail', () => {
    const condFn: jest.Mock<boolean> = jest.fn();
    condFn.mockReturnValue(false);
    const names: ReadonlyArray<string> = [
      'vjowe',
      '',
      '12509',
      '%)!%#',
    ];
    const validators: ReadonlyArray<Validator> = names.map((name) => condition(condFn, name));
    const composedValidator: Validator = compose(...validators);

    const valueSequence: ReadonlyArray<string> = [
      '',
      'pqweqwr',
      '290643634',
      'gwe0rf3t06232',
      '!^$#@#@%^*((*&^$))',
    ];

    for (const value of valueSequence) {
      expect(composedValidator(value).valid).toBe(false);
    }
  });

  it('should return errors includes all names when all passed validators fail', () => {
    const condFn: jest.Mock<boolean> = jest.fn();
    condFn.mockReturnValue(false);
    const names: ReadonlyArray<string> = [
      'gw0@R',
      '',
      '$y3$125',
      't90vee',
    ];
    const validators: ReadonlyArray<Validator> = names.map((name) => condition(condFn, name));
    const composedValidator: Validator = compose(...validators);

    const valueSequence: ReadonlyArray<string> = [
      '',
      'rkeq',
      '920345',
      'gj521',
      '!@',
    ];

    for (const value of valueSequence) {
      const errors: ReadonlyArray<string> = composedValidator(value).errors;
      expect(names.every((name: string) => errors.includes(name))).toBe(true);
    }
  });
});

import _ from 'lodash-es';

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<string>;
}

export type Validator = (
  value: string,
) => ValidationResult;

type Compose = (
  ...validators: Array<Validator | Array<Validator>>
) => Validator;
export const compose: Compose = (
  ...args: Array<Validator | Array<Validator>>
): Validator => {
  const validators: Array<Validator> = _.flatten<Validator>(args);

  return (value: string): ValidationResult => validators
    .map((validator) => validator(value))
    .reduce((acc: ValidationResult, vr: ValidationResult): ValidationResult => ({
      valid: acc.valid && vr.valid,
      errors: _.union(acc.errors, vr.errors),
    }), {
      valid: true,
      errors: [],
    });
};

export const condition: (checker: (value: string) => boolean, name?: string) => Validator = (
  checker: (value: string) => boolean, name: string = 'condition',
): Validator => (value: string): ValidationResult => {
  const valid: boolean = checker(value);

  return {
    valid,
    errors: valid ? [] : [name],
  };
};

export const required: (name?: string) => Validator = (
  name: string = 'required',
): Validator => condition((value: string): boolean => value.length !== 0, name);

export const pattern: (regexp: RegExp, name?: string) => Validator = (
  regexp: RegExp, name: string = 'pattern',
): Validator => condition((value: string): boolean => regexp.test(value), name);

export const maxLength: (length: number, name?: string) => Validator = (
  length: number, name: string = 'maxLength',
): Validator => condition((value: string): boolean => value.length <= length, name);

export const minLength: (length: number, name?: string) => Validator = (
  length: number, name: string = 'minLength',
): Validator => condition((value: string): boolean => value.length >= length, name);

export const emailValidator: Validator = compose(
  // eslint-disable-next-line max-len
  pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
);

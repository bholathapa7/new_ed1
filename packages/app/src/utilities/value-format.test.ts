import format from './value-format';

/* eslint-disable no-magic-numbers */
describe('value format', () => {
  it('should format 0 without unit', () => {
    expect(format(0)).toBe('0');
  });

  it('should format 0 with unit', () => {
    expect(format(0, { unit: 'm' })).toBe('0 m');
  });

  it('should format small integers', () => {
    expect(format(243, { unit: 'g' })).toBe('243 g');
  });

  it('should format small integers ends with 0', () => {
    expect(format(300, { unit: 'N' })).toBe('300 N');
  });

  it('should format small fractions', () => {
    expect(format(53.4262)).toBe('53.43');
  });

  it('should format small fractions', () => {
    expect(format(66.3)).toBe('66.3');
  });

  it('should format large integers', () => {
    expect(format(520203, { unit: 'm' })).toBe('520.2 km');
  });

  it('should format large fractions', () => {
    expect(format(2030445.2324, { unit: 'g' })).toBe('2.03 Mg');
  });

  it('should format large integers with different gap', () => {
    expect(format(40242455623, { unit: 'B', gap: 1024 })).toBe('37.48 GB');
  });

  it('should format large integers without trimming', () => {
    expect(format(230200, { unit: 'N', trimZero: false })).toBe('230.20 kN');
  });

  it('should format large integers with specific digit length', () => {
    expect(format(6290054, { unit: 'g', digit: 5 })).toBe('6.29005 Mg');
  });

  it('should format large integers with 0 digit length', () => {
    expect(format(705345, { unit: 'm', digit: 0 })).toBe('705 km');
  });
});
/* eslint-enable no-magic-numbers */

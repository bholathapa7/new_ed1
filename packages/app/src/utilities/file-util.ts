/**
 * generates almost-unique string-typed id for file
 */
export const calculateHash: (file: File) => string = (
  file,
) => `${file.name}/ /${file.size}`;

export const fileEq: (
  file0: File,
) => (
  file1: File,
) => boolean = (
  file0,
) => (
  file1,
) => file0.name === file1.name && file0.size === file1.size;

export const fileNeq: (
  file0: File,
) => (
  file1: File,
) => boolean = (
  file0,
) => {
  const fn: (file1: File) => boolean = fileEq(file0);

  return (
    file1,
  ) => !fn(file1);
};

/**
 * String to ArrayBuffer function
 */
export const s2ab: (s: string) => ArrayBuffer = (s) => {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  // eslint-disable-next-line no-magic-numbers, no-bitwise
  Array.from(s).forEach((c, i) => view[i] = c.charCodeAt(0) & 0xFF);

  return buf;
};

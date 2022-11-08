/* eslint-disable max-len */
import _ from 'lodash-es';

import {
  calculateHash,
  fileEq,
  fileNeq,
  s2ab,
} from './file-util';

describe('calculateHash', () => {
  it('should output a unique hash for each file', () => {
    const names: Array<string> = ['squid', 'octopus', 'han river', 'ramen', 'cheese cream cake', 'squid', 'squid', 'ramen'];
    const blobParts: Array<string> = [
      'fwafeoaiwengeiowngowengiowapnvaoiwvpawenvpawnawoipnnboiawrowriobnvoiewniv',
      'fqoihfh139h81h98h984h189h41298h41928hr12fn3noiclkad',
      'aweifo2oi2309h1039hf109h013hf13',
      'faefklwef', 'fwnvlwbrroi4bob920092t0b903fb90209303',
      'adsfsdlfnasdfn',
      '123',
      'dfdfdfdfdfdfdfdfdfdfddfdfddfdfd',
    ];

    expect(names.length).toEqual(blobParts.length);

    const fileHashes: Array<string> = _.zip(names, blobParts)
      .map(([name, blobPart]: [string, string]) => calculateHash(new File([blobPart], name)));

    expect((new Set(fileHashes)).size).toEqual(names.length);
  });
});

const file0: File = new File(['squid is the best'], 'squid');
const file1: File = new File(['squid is the best'], 'squid');
const file2: File = new File(['a'], 'a');

type expectBooleanFromFileFunction =
  (val: boolean, func: (file0: File) => (file1: File) => boolean) => void;

const expectBooleanFromDifferentFiles: expectBooleanFromFileFunction =
  (val, func) => {
    expect(func(file0)(file2)).toBe(val);
    expect(func(file1)(file2)).toBe(val);
    expect(func(file2)(file0)).toBe(val);
    expect(func(file2)(file1)).toBe(val);
  };

const expectBooleanFromSameFiles: expectBooleanFromFileFunction =
  (val, func) => {
    expect(func(file0)(file1)).toBe(val);
    expect(func(file1)(file0)).toBe(val);
    expect(func(file2)(file2)).toBe(val);
  };

describe('fileEq', () => {
  it('should output true if two files are the same', () => {
    expectBooleanFromSameFiles(true, fileEq);
  });

  it('should output false if two files are different', () => {
    expectBooleanFromDifferentFiles(false, fileEq);
  });
});

describe('fileNeq', () => {
  it('should output false if two files are the same', () => {
    expectBooleanFromSameFiles(false, fileNeq);
  });

  it('should output false if two files are different', () => {
    expectBooleanFromDifferentFiles(true, fileNeq);
  });
});

describe('s2ab', () => {
  it('should convert string to arraybuffer', () => {
    const str: string = 'lfaoiw4fhoi2hoi23hoi23hgfoi31foasfoiewhfoehwf8hwg98hw894ha9g8h89ha89ewh89hf89ewh h89hwe89fh89 afh89eha89 e89h f89whf89aweh98hwef98hwwe8hf 9wehf98e whe9fhaw9efh8w9ha9 wef8e9wef89e hoidfho adfsohsoioaf aoi faosifs dfasiohoosi fhadso if i13fio31nbfio3gnboiaerniovanrwoivnwroivnowivnwoinvweoinowaef';
    expect(s2ab(str).byteLength).toEqual(str.length);
  });

  it('should convert very weird strings to arraybuffer as well', () => {
    const str: string = '!!! $$#@ !#$@$@%^&*()(*&^%$#@!~!#@$ sdf ლ( ̅°̅ ੪ ̅°̅ )ლ ᕦ( ▨̅ ͜▨̅ )ᕥ ( ဓ д ဓ )ၛ (X ౪ X ) (ၴ෴ၴ) ⸻⸻⸻⸻⸻⸻⸻⸻⸺ ( o ) ( ႎ _ ႎ ) (ၜᗝ ၜ) ( ^ ᗜ ^ ) (⌤) ( ၜ 𝄩 ၜ ) ⸻⸻⸻⸻⸻⸻⸻⸻⸺ (☉ ϖ ☉) (ၜᔕၜ) ';
    expect(s2ab(str).byteLength).toEqual(str.length);
  });
});

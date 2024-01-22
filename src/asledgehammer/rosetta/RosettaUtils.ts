import * as fs from 'fs';

export const RESERVED_FUNCTION_NAMES = ['toString', 'valueOf'];
export const RESERVED_WORDS = [
  'and',
  'break',
  'do',
  'else',
  'elseif',
  'end',
  'false',
  'for',
  'function',
  'if',
  'in',
  'local',
  'nil',
  'not',
  'or',
  'repeat',
  'return',
  'then',
  'true',
  'until',
  'while',

  // NOTE: This is a technical issue involving YAML interpreting
  //       this as a BOOLEAN not a STRING value.
  'on',
  'off',
  'yes',
  'no',
];

export const formatName = (name: string): string => {
  for (const reservedWord of RESERVED_WORDS) {
    if (name.toLowerCase() === reservedWord) return '__' + name + '__';
  }
  for (const reservedFunctionName of RESERVED_FUNCTION_NAMES) {
    if (name === reservedFunctionName) return '__' + name + '__';
  }
  return name;
};

export const getFilesFromDir = (dir: string): string[] => {
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory doesn't exist: ${dir}`);
  } else if (!fs.statSync(dir).isDirectory()) {
    throw new Error(`Path isn't directory: ${dir}`);
  }

  return fs.readdirSync(dir, { recursive: true }).map((s) => `${dir}/${s}`);
};

export const mkdirs = (dir: string) => {
  dir = dir.replace(/\\/g, '/').trim();
  if (dir.indexOf('/') !== -1) {
    let next = '';
    for (const sub of dir.split('/')) {
      next += `${sub}/`;
      if (!fs.existsSync(next)) fs.mkdirSync(next);
    }
  } else {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  }
};

export const isEmptyObject = (object: any): boolean => {
  return object === undefined || Object.keys(object).length <= 0;
};

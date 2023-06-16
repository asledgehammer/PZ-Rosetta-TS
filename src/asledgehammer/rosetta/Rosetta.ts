import * as fs from 'fs';

import { getFilesFromDir } from './RosettaUtils';
import { RosettaFile } from './RosettaFile';
import { RosettaPatch } from './RosettaPatch';

import { RosettaJavaNamespace } from './java/RosettaJavaNamespace';
import { RosettaLuaTable } from './lua/RosettaLuaTable';
import { RosettaLuaFunction } from './lua/RosettaLuaFunction';
import { RosettaLuaValue } from './lua/RosettaLuaValue';
import { RosettaLuaClass } from './lua/RosettaLuaClass';

export class Rosetta {
  readonly patches: { [name: string]: RosettaPatch } = {};
  readonly files: { [path: string]: RosettaFile } = {};

  /* (Java) */
  readonly namespaces: { [name: string]: RosettaJavaNamespace } = {};

  /* (Lua) */
  readonly luaClasses: { [name: string]: RosettaLuaClass } = {};
  readonly tables: { [name: string]: RosettaLuaTable } = {};
  readonly functions: { [name: string]: RosettaLuaFunction } = {};
  readonly values: { [name: string]: RosettaLuaValue } = {};

  load(dir: string) {
    this.loadJSON(dir);
    this.loadPatches(dir);
  }

  private loadJSON(dir: string) {
    const dirJSON = `${dir}/JSON`;
    if (!fs.existsSync(dirJSON)) {
      throw new Error(`Directory doesn't exist: ${dirJSON}`);
    } else if (!fs.statSync(dirJSON).isDirectory()) {
      throw new Error(`Path isn't directory: ${dirJSON}`);
    }
    const files = getFilesFromDir(dirJSON);
    for (const file of files) {
      const rFile = new RosettaFile(this, JSON.parse(`${fs.readFileSync(file)}`));
      this.files[file] = rFile;
    }
  }

  private loadPatches(dir: string) {
    const dirPatches = `${dir}/patches`;
    const files = fs.readdirSync(dirPatches);
    if (files.length === 0) return;
    for (const file of files) {
      const fileStats = fs.statSync(`${dirPatches}/${file}`);
      if (!fileStats.isDirectory()) continue;
      this.loadPatch(`${dirPatches}/${file}`);
    }
  }

  private loadPatch(dir: string) {
    const patch = new RosettaPatch(this, dir);
    patch.load();
    this.patches[patch.name] = patch;
  }
}

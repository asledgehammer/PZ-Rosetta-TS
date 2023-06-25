import * as fs from 'fs';
import * as YAML from 'yaml';

import { getFilesFromDir } from './RosettaUtils';
import { RosettaFile } from './RosettaFile';
import { RosettaPatch } from './RosettaPatch';

import { RosettaJavaNamespace } from './java/RosettaJavaNamespace';
import { RosettaLuaTable } from './lua/RosettaLuaTable';
import { RosettaLuaFunction } from './lua/RosettaLuaFunction';
import { RosettaLuaTableField } from './lua/RosettaLuaTableField';
import { RosettaLuaClass } from './lua/RosettaLuaClass';
import { RosettaPatchConfiguration } from './RosettaPatchConfiguration';
import { RosettaFileInfo } from './RosettaFileInfo';

export let JSON_SCHEMA_URL =
  'https://raw.githubusercontent.com/asledgehammer/PZ-Rosetta-Schema/main/rosetta-schema.json';
export let JSON_PATCH_SCHEMA_URL =
  'https://raw.githubusercontent.com/asledgehammer/PZ-Rosetta-Schema/main/rosetta-patch-schema.json';

export class Rosetta {
  readonly patches: { [name: string]: RosettaPatch } = {};
  readonly files: { [path: string]: RosettaFile } = {};

  /* (Java) */
  readonly namespaces: { [name: string]: RosettaJavaNamespace } = {};

  /* (Lua) */
  readonly luaClasses: { [name: string]: RosettaLuaClass } = {};
  readonly tables: { [name: string]: RosettaLuaTable } = {};
  readonly functions: { [name: string]: RosettaLuaFunction } = {};
  readonly values: { [name: string]: RosettaLuaTableField } = {};

  readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  load() {
    /*
     * (Attempt to load JSON files first. If this directory doesn't exist, assume that this is the YAML flavor of
     * Rosetta)
     */
    if (!this.loadJSON()) this.loadYAML();
    this.loadPatches();
  }

  private loadJSON(): boolean {
    const dirJSON = `${this.dir}/json`;
    if (!fs.existsSync(dirJSON)) {
      return false;
    } else if (!fs.statSync(dirJSON).isDirectory()) {
      throw new Error(`Path isn't directory: ${dirJSON}`);
    }
    const files = getFilesFromDir(dirJSON);
    for (const file of files) {
      const fileInfo: RosettaFileInfo = { uri: file, type: 'json' };
      const raw = JSON.parse(`${fs.readFileSync(file)}`);
      const rFile = new RosettaFile(this, fileInfo, raw, true);
      this.files[RosettaFile.asFileID(file)] = rFile;
    }
    return true;
  }

  private loadYAML(): boolean {
    const dirYAML = `${this.dir}/yml`;
    if (!fs.existsSync(dirYAML)) {
      return false;
    } else if (!fs.statSync(dirYAML).isDirectory()) {
      throw new Error(`Path isn't directory: ${dirYAML}`);
    }
    const files = getFilesFromDir(dirYAML);
    for (const file of files) {
      const fileInfo: RosettaFileInfo = { uri: file, type: 'yml' };
      const raw = YAML.parse(`${fs.readFileSync(file)}`);
      const rFile = new RosettaFile(this, fileInfo, raw, true);
      this.files[RosettaFile.asFileID(file)] = rFile;
    }
    return true;
  }

  private loadPatches() {
    const dirPatches = `${this.dir}/patches`;
    const files = fs.readdirSync(dirPatches);
    if (files.length === 0) return;
    for (const patchID of files) {
      const fileStats = fs.statSync(`${dirPatches}/${patchID}`);
      if (!fileStats.isDirectory()) continue;
      this.loadPatch(patchID);
    }
  }

  private loadPatch(id: string) {
    const config = RosettaPatch.readConfig(id, `${this.dir}/patches/${id}`);
    const patch = new RosettaPatch(this, id, config);
    patch.load();
    this.patches[id.toLowerCase().trim()] = patch;
  }

  createPatch(id: string, info: RosettaPatchConfiguration): RosettaPatch {
    const patch = new RosettaPatch(this, id, info);
    this.patches[id.toLowerCase().trim()] = patch;
    return patch;
  }

  getPatch(id: string) {
    return this.patches[id.toLowerCase().trim()];
  }

  /**
   * **NOTE**: This only looks for the main files for Rosetta. To look for patch files, use
   * {@link RosettaPatch.getFile RosettaPatch.getFile(path)})
   *
   * @param path The file's identifier. (See {@link RosettaFile.asFileID() RosettaFile.asFileID(path)} for more info)
   * @returns The file in the patch. (If exists)
   */
  getFile(path: string): RosettaFile | undefined {
    return this.files[RosettaFile.asFileID(path)];
  }
}

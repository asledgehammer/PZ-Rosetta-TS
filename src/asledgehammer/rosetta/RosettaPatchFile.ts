import * as fs from 'fs';
import * as Assert from '../Assert';

import * as YAML from 'yaml';

import { JSON_PATCH_SCHEMA_URL, JSON_SCHEMA_URL, Rosetta } from './Rosetta';
import { RosettaEntity } from './RosettaEntity';

import { RosettaJavaNamespace } from './java/RosettaJavaNamespace';
import { RosettaLuaFunction } from './lua/RosettaLuaFunction';
import { RosettaLuaTable } from './lua/RosettaLuaTable';
import { RosettaLuaTableField } from './lua/RosettaLuaTableField';
import { RosettaLuaClass } from './lua/RosettaLuaClass';
import { RosettaFileInfo } from './RosettaFileInfo';
import { mkdirs } from './RosettaUtils';
import { JavaNamespacePatch } from './java/patch/JavaNamespacePatch';
import { JavaClassPatch } from './java/patch/JavaClassPatch';

/**
 * **RosettaFile**
 *
 * @author Jab
 */
export class RosettaPatchFile extends RosettaEntity {
  /* (Java) */
  readonly namespaces: { [name: string]: JavaNamespacePatch } = {};

  /* (Lua) */
  readonly luaClasses: { [name: string]: RosettaLuaClass } = {};
  readonly tables: { [name: string]: RosettaLuaTable } = {};
  readonly functions: { [name: string]: RosettaLuaFunction } = {};
  readonly fields: { [name: string]: RosettaLuaTableField } = {};

  /** The internal file identifier in Rosetta. */
  readonly id: string;
  readonly fileInfo: RosettaFileInfo;
  readonly rosetta: Rosetta;

  constructor(rosetta: Rosetta, fileInfo: RosettaFileInfo, raw: { [key: string]: any } = {}, readOnly: boolean) {
    super(raw, readOnly);

    this.rosetta = rosetta;

    Assert.assertNonNull(rosetta, 'rosetta');

    this.fileInfo = fileInfo;
    this.id = RosettaPatchFile.asFileID(fileInfo.uri);

    /* NAMESPACES */
    if (raw.namespaces !== undefined) {
      const rawNamespaces = raw.namespaces;
      for (const name of Object.keys(rawNamespaces)) {
        const rawNamespace = rawNamespaces[name];
        rawNamespace.name = name;
        const namespace = new JavaNamespacePatch(rawNamespace);
        this.namespaces[namespace.name] = this.namespaces[name] = namespace;
      }
    }

    /* (Tables) */
    if (raw.tables !== undefined) {
      const rawTables = raw.tables;
      for (const name of Object.keys(rawTables)) {
        const rawTable = rawTables[name];
        let table = rosetta.tables[name];

        if (table == null) {
          table = new RosettaLuaTable(name, rawTable);
          rosetta.tables[table.name] = rosetta.tables[name] = rawTable;
        } else {
          table.parse(rawTable);
        }

        this.tables[table.name] = this.tables[name] = table;
      }
    }

    /* (Functions) */
    if (raw.functions !== undefined) {
      const rawFunctions = raw.functions;
      for (const name of Object.keys(rawFunctions)) {
        const rawFunction = rawFunctions[name];
        let func = rosetta.functions[name];

        if (func == null) {
          func = new RosettaLuaFunction(name, rawFunction);
          rosetta.functions[func.name] = rosetta.functions[name] = rawFunction;
        } else {
          func.parse(rawFunction);
        }

        this.functions[func.name] = this.functions[name] = func;
      }
    }

    /* (Values) */
    if (raw.values !== undefined) {
      const rawValues = raw.values;
      for (const name of Object.keys(rawValues)) {
        const rawValue = rawValues[name];
        let value = rosetta.values[name];
        if (value == null) {
          value = new RosettaLuaTableField(name, rawValue);
          rosetta.values[value.name] = rosetta.values[name] = rawValue;
        } else {
          value.parse(rawValue);
        }

        this.fields[value.name] = this.fields[name] = value;
      }
    }

    /* (Lua Classes) */
    if (raw.luaClasses !== undefined) {
      const rawLuaClasses = raw.luaClasses;
      for (const name of Object.keys(rawLuaClasses)) {
        const rawLuaClass = rawLuaClasses[name];
        let luaClass = rosetta.luaClasses[name];
        if (luaClass == null) {
          luaClass = new RosettaLuaClass(name, rawLuaClass);
          rosetta.luaClasses[luaClass.name] = rosetta.luaClasses[name] = luaClass;
        } else {
          luaClass.parse(rawLuaClass);
        }

        this.luaClasses[luaClass.name] = this.luaClasses[name] = luaClass;
      }
    }
  }

  /**
   * Creates a new Java namespace in the patch.
   *
   * @param name The name of the new Java namespace.
   * @returns The new Java namespace.
   *
   * @throws Error Thrown if:
   * - A global Lua field already exists with the same name in the patch.
   */
  createNamespace(name: string): JavaNamespacePatch {
    const namespace = this.rosetta.namespaces[name];

    // (Only check for the file instance)
    if (this.namespaces[name]) {
      throw new Error(`A Java namespace already exists: ${name}`);
    }

    return (this.namespaces[name] = new JavaNamespacePatch(namespace));
  }

  createJavaClass(namespacePath: string, className: string): JavaClassPatch {
    const rNamespace = this.rosetta.namespaces[namespacePath];
    let namespace = this.namespaces[namespacePath];
    if (namespace === undefined) {
      namespace = this.namespaces[namespacePath] = new JavaNamespacePatch({ name: namespacePath });
    }

    return (namespace.classes[className] = rNamespace.createClassPatch(className));
  }

  /**
   * Creates a new Lua class in the patch.
   *
   * @param name The name of the new Lua class.
   * @returns The new Lua class.
   *
   * @throws Error Thrown if:
   * - A global Lua field already exists with the same name in the patch.
   */
  createLuaClass(name: string): RosettaLuaClass {
    const luaClass = new RosettaLuaClass(name);

    // (Only check for the file instance)
    if (this.luaClasses[luaClass.name]) {
      throw new Error(`A global Lua Class already exists: ${luaClass.name}`);
    }

    this.luaClasses[luaClass.name] = luaClass;

    return luaClass;
  }

  /**
   * Creates a new Lua table in the patch.
   *
   * @param name The name of the new Lua table.
   * @returns The new Lua table.
   *
   * @throws Error Thrown if:
   * - A global Lua field already exists with the same name in the patch.
   */
  createGlobalLuaTable(name: string): RosettaLuaTable {
    const luaTable = new RosettaLuaTable(name);

    // (Only check for the file instance)
    if (this.tables[luaTable.name]) {
      throw new Error(`A global Lua Table already exists: ${luaTable.name}`);
    }

    this.tables[luaTable.name] = luaTable;

    return luaTable;
  }

  /**
   * Creates a new global Lua function in the patch.
   *
   * @param name The name of the new global Lua function.
   * @returns The new global Lua function.
   *
   * @throws Error Thrown if:
   * - A global Lua field already exists with the same name in the patch.
   */
  createGlobalLuaFunction(name: string): RosettaLuaFunction {
    const luaFunction = new RosettaLuaFunction(name);

    // (Only check for the file instance)
    if (this.functions[luaFunction.name]) {
      throw new Error(`A global Lua Function already exists: ${luaFunction.name}`);
    }

    this.functions[luaFunction.name] = luaFunction;

    return luaFunction;
  }

  /**
   * Creates a new global Lua field in the patch.
   *
   * @param name The name of the new global Lua field.
   * @returns The new global Lua field.
   *
   * @throws Error Thrown if:
   * - A global Lua field already exists with the same name in the patch.
   */
  createGlobalLuaField(name: string): RosettaLuaTableField {
    const luaField = new RosettaLuaTableField(name);

    // (Only check for the file instance)
    if (this.fields[luaField.name]) {
      throw new Error(`A global Lua Field already exists: ${luaField.name}`);
    }

    this.fields[luaField.name] = luaField;

    return luaField;
  }

  save(dir: string, patch: boolean = false) {
    const { fileInfo } = this;
    const { type, uri } = fileInfo;

    const json = this.toJSON(patch);
    const file = `${dir}/${type}/${uri}.${type}`;

    let split = file.split('/');
    split.pop();
    const parentDir = split.join('/');
    mkdirs(parentDir);

    const text =
      type === 'json'
        ? JSON.stringify({ $schema: JSON_PATCH_SCHEMA_URL, ...json }, null, 4)
        : `# yaml-language-server: $schema=${JSON_PATCH_SCHEMA_URL}\n` + YAML.stringify(json);
    fs.writeFileSync(file, text);
  }

  toJSON(patch: boolean = false) {
    const { namespaces, luaClasses, functions, tables, fields } = this;

    const json: any = {};
    /* (Java) */
    let keys = Object.keys(namespaces);
    if (keys.length) {
      json.namespaces = {};
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        json.namespaces[key] = namespaces[key].toJSON();
      }
    }

    /* (Global Lua Classes) */
    keys = Object.keys(luaClasses);
    if (keys.length) {
      json.luaClasses = {};
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        json.luaClasses[key] = luaClasses[key].toJSON(patch);
      }
    }

    /* (Global Tables) */
    keys = Object.keys(tables);
    if (keys.length) {
      json.tables = {};
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        json.tables[key] = tables[key].toJSON(patch);
      }
    }

    /* (Global Functions) */
    keys = Object.keys(functions);
    if (keys.length) {
      json.functions = {};
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        json.functions[key] = functions[key].toJSON(patch);
      }
    }

    /* (Global Values) */
    keys = Object.keys(fields);
    if (keys.length) {
      json.fields = {};
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        json.fields[key] = fields[key].toJSON(patch);
      }
    }

    return json;
  }

  /**
   * Transforms a raw path URI to a file identifier by:
   * - Forcing all lower-case lettering.
   * - Forces all directory delimiters to be `/`.
   * - Removes `/` at the beginning of the URI.
   * - Removes `json/` and `yml/` at the beginning of the URI.
   * - Removes '.ext' from the end of the URI.
   *
   * @param path The raw path URI to transform.
   * @returns The transformed path URI as a file identifier.
   */
  static asFileID(path: string): string {
    path = path.toLowerCase().trim().replace('/\\/g', '/');

    /* ('/' check at beginning of path) */
    if (path.indexOf('/') === 0) path = path.substring(1);

    /* ('json/' check at beginning of path) */
    if (path.indexOf('json/') === 0) path = path.substring('json/'.length);

    /* ('yml/' check at beginning of path) */
    if (path.indexOf('yml/') === 0) path = path.substring('yml/'.length);

    // (File extension check) */
    if (path.indexOf('.') !== -1) {
      const split = path.split('.');
      split.pop();
      path = split.join('.');
    }

    return path;
  }
}

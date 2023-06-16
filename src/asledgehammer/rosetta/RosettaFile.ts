import * as Assert from '../Assert';

import { Rosetta } from './Rosetta';
import { RosettaEntity } from './RosettaEntity';

import { RosettaJavaNamespace } from './java/RosettaJavaNamespace';
import { RosettaLuaFunction } from './lua/RosettaLuaFunction';
import { RosettaLuaTable } from './lua/RosettaLuaTable';
import { RosettaLuaValue } from './lua/RosettaLuaValue';
import { RosettaLuaClass } from './lua/RosettaLuaClass';

export class RosettaFile extends RosettaEntity {
  /* (Java) */
  readonly namespaces: { [name: string]: RosettaJavaNamespace } = {};

  /* (Lua) */
  readonly luaClasses: { [name: string]: RosettaLuaClass } = {};
  readonly tables: { [name: string]: RosettaLuaTable } = {};
  readonly functions: { [name: string]: RosettaLuaFunction } = {};
  readonly values: { [name: string]: RosettaLuaValue } = {};

  constructor(rosetta: Rosetta, raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonNull(rosetta, 'rosetta');

    /* NAMESPACES */
    if (raw['namespaces'] !== undefined) {
      const rawNamespaces = raw['namespaces'];
      for (const name of Object.keys(rawNamespaces)) {
        const rawNamespace = rawNamespaces[name];
        let namespace = rosetta.namespaces[name];

        if (namespace == null) {
          namespace = new RosettaJavaNamespace(name, rawNamespace);
          rosetta.namespaces[namespace.name] = rosetta.namespaces[name] = namespace;
        } else {
          namespace.parse(rawNamespace);
        }

        this.namespaces[namespace.name] = this.namespaces[name] = namespace;
      }
    }

    /* (Tables) */
    if (raw['tables'] !== undefined) {
      const rawTables = raw['tables'];
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
    if (raw['functions'] !== undefined) {
      const rawFunctions = raw['functions'];
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
    if (raw['values'] !== undefined) {
      const rawValues = raw['values'];
      for (const name of Object.keys(rawValues)) {
        const rawValue = rawValues[name];
        let value = rosetta.values[name];
        if (value == null) {
          value = new RosettaLuaValue(name, rawValue);
          rosetta.values[value.name] = rosetta.values[name] = rawValue;
        } else {
          value.parse(rawValue);
        }

        this.values[value.name] = this.values[name] = value;
      }
    }

    /* (Lua Classes) */
    if (raw['luaClasses'] !== undefined) {
      const rawLuaClasses = raw['luaClasses'];
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
}

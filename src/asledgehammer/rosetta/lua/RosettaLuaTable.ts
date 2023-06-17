import * as Assert from '../../Assert';

import { RosettaEntity } from '../RosettaEntity';

import { RosettaLuaFunction } from './RosettaLuaFunction';
import { RosettaLuaValue } from './RosettaLuaValue';

export class RosettaLuaTable extends RosettaEntity {
  readonly values: { [id: string]: RosettaLuaValue } = {};
  readonly tables: { [id: string]: RosettaLuaTable } = {};
  readonly functions: { [id: string]: RosettaLuaFunction } = {};
  readonly name: string;
  notes: string | undefined;

  constructor(name: string, raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonEmptyString(name, 'name');

    this.name = name;
    this.notes = this.readNotes();

    /* (Tables) */
    if (raw.tables !== undefined) {
      const rawTables: { [key: string]: any } = raw.tables;
      for (const name2 of Object.keys(rawTables)) {
        const rawTable = rawTables[name2];
        const table = new RosettaLuaTable(name2, rawTable);
        this.tables[table.name] = this.tables[name2] = table;
      }
    }

    /* (Functions) */
    if (raw.functions !== undefined) {
      const rawFunctions: { [key: string]: any } = raw.functions;
      for (const name2 of Object.keys(rawFunctions)) {
        const rawFunction = rawFunctions[name2];
        const func = new RosettaLuaFunction(name2, rawFunction);
        this.functions[func.name] = this.functions[name2] = func;
      }
    }

    /* (Values) */
    if (raw.values !== undefined) {
      const rawValues: { [key: string]: any } = raw.values;
      for (const name2 of Object.keys(rawValues)) {
        const rawValue = rawValues[name2];
        const value = new RosettaLuaValue(name2, rawValue);
        this.values[value.name] = this.values[name2] = value;
      }
    }
  }

  parse(raw: { [key: string]: any }) {
    this.notes = this.readNotes(raw);

    /* (Tables) */
    if (raw.tables !== undefined) {
      const rawTables: { [key: string]: any } = raw.tables;
      for (const name of Object.keys(rawTables)) {
        const rawTable = rawTables[name];
        let table = this.tables[name];
        if (table === undefined) {
          table = new RosettaLuaTable(name, rawTable);
        } else {
          table.parse(rawTable);
        }
        this.tables[table.name] = this.tables[name] = table;
      }
    }

    /* (Functions) */
    if (raw.functions !== undefined) {
      const rawFunctions: { [key: string]: any } = raw.functions;
      for (const name of Object.keys(rawFunctions)) {
        const rawFunction = rawFunctions[name];
        let func = this.functions[name];
        if (func === undefined) {
          func = new RosettaLuaFunction(name, rawFunction);
        } else {
          func.parse(rawFunction);
        }
        this.functions[func.name] = this.functions[name] = func;
      }
    }

    /* (Values) */
    if (raw.values !== undefined) {
      const rawValues: { [key: string]: any } = raw.values;
      for (const name of Object.keys(rawValues)) {
        const rawValue = rawValues[name];
        let value = this.values[name];
        if (value === undefined) {
          value = new RosettaLuaValue(name, rawValue);
        } else {
          value.parse(rawValue);
        }
        this.values[value.name] = this.values[name] = value;
      }
    }
  }
}

import * as Assert from '../../Assert';

import { formatName } from '../RosettaUtils';
import { RosettaEntity } from '../RosettaEntity';
import { RosettaLuaFunction } from './RosettaLuaFunction';
import { RosettaLuaField } from './RosettaLuaField';
import { RosettaLuaConstructor } from './RosettaLuaConstructor';

export class RosettaLuaClass extends RosettaEntity {
  readonly extendz: string | undefined;
  readonly name: string;

  readonly functions: { [name: string]: RosettaLuaFunction } = {};
  readonly methods: { [name: string]: RosettaLuaFunction } = {};
  readonly fields: { [name: string]: RosettaLuaField } = {};
  conztructor: RosettaLuaConstructor | undefined;
  deprecated: boolean = false;
  notes: string | undefined;

  constructor(name: string, raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonEmptyString(name, 'name');

    this.name = formatName(name);
    this.extendz = this.readString('extends');

    this.notes = this.readNotes();
    this.deprecated = this.readBoolean('deprecated') === true;

    /* (Constructor) */
    if (raw.constructor !== undefined) {
      const rawConstructor = raw.constructor;
      this.conztructor = new RosettaLuaConstructor(this, rawConstructor);
    }

    /* (Methods) */
    if (raw.methods !== undefined) {
      const rawMethods: { [key: string]: any } = raw.methods;
      for (const name2 of Object.keys(rawMethods)) {
        const rawMethod = rawMethods[name2];
        const method = new RosettaLuaFunction(name2, rawMethod);
        this.methods[name2] = this.methods[method.name] = method;
      }
    }

    /* (Functions) */
    if (raw.functions !== undefined) {
      const rawFunctions: { [key: string]: any } = raw.functions;
      for (const name2 of Object.keys(rawFunctions)) {
        const rawFunction = rawFunctions[name2];
        const func = new RosettaLuaFunction(name2, rawFunction);
        this.functions[name2] = this.functions[func.name] = func;
      }
    }

    /* (Fields) */
    if (raw.fields !== undefined) {
      const rawFields: { [key: string]: any } = raw.fields;
      for (const name2 of Object.keys(rawFields)) {
        const rawField = rawFields[name2];
        const field = new RosettaLuaField(name2, rawField);
        this.fields[name2] = this.fields[field.name] = field;
      }
    }
  }

  parse(raw: { [key: string]: any }) {
    this.notes = this.readNotes(raw);
    this.deprecated = this.readBoolean('deprecated', raw) === true;

    /* (Constructor) */
    if (raw.constructor !== undefined) {
      const rawConstructor = raw.constructor;
      this.conztructor = new RosettaLuaConstructor(this, rawConstructor);
    }

    /* (Methods) */
    if (raw.methods !== undefined) {
      const rawMethods: { [key: string]: any } = raw.methods;
      for (const name of Object.keys(rawMethods)) {
        const rawMethod = rawMethods[name];
        let method = this.methods[name];
        if (method == null) {
          method = new RosettaLuaFunction(name, rawMethod);
          this.methods[name] = this.methods[method.name] = method;
        } else {
          method.parse(rawMethod);
        }
      }
    }

    /* (Functions) */
    if (raw.functions !== undefined) {
      const rawFunctions: { [key: string]: any } = raw.functions;
      for (const name of Object.keys(rawFunctions)) {
        const rawFunction = rawFunctions[name];
        let func = this.functions[name];
        if (func == null) {
          func = new RosettaLuaFunction(name, rawFunction);
          this.functions[name] = this.functions[func.name] = func;
        } else {
          func.parse(rawFunction);
        }
      }
    }

    /* (Fields) */
    if (raw.fields !== undefined) {
      const rawFields: { [key: string]: any } = raw.fields;
      for (const name of Object.keys(rawFields)) {
        const rawField = rawFields[name];
        let field = this.fields[name];
        if (field == null) {
          field = new RosettaLuaField(name, rawField);
          this.fields[name] = this.fields[field.name] = field;
        } else {
          field.parse(rawField);
        }
      }
    }
  }
}

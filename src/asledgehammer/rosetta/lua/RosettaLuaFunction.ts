import * as Assert from '../../Assert';

import { formatName } from '../RosettaUtils';
import { RosettaEntity } from '../RosettaEntity';
import { RosettaLuaParameter } from './RosettaLuaParameter';
import { RosettaLuaReturns } from './RosettaLuaReturns';

export class RosettaLuaFunction extends RosettaEntity {
  readonly name: string;
  parameters: RosettaLuaParameter[] = [];
  returns: RosettaLuaReturns;
  notes: string | undefined;
  deprecated: boolean | undefined;

  constructor(name: string, raw: { [key: string]: any } = {}) {
    super(raw);

    Assert.assertNonEmptyString(name, 'name');

    this.name = formatName(name);
    this.deprecated = this.readBoolean('deprecated') != null;

    /* (Properties) */
    this.notes = this.readNotes();

    /* (Parameters) */
    if (raw.parameters !== undefined) {
      const rawParameters: { [key: string]: any }[] = raw.parameters;
      for (const rawParameter of rawParameters) {
        const parameter = new RosettaLuaParameter(rawParameter);
        this.parameters.push(parameter);
      }
    }

    /* (Returns) */
    if (raw.returns === undefined) {
      throw new Error(`Method does not have returns definition: ${this.name}`);
    }
    this.returns = new RosettaLuaReturns(raw.returns);
  }

  parse(raw: { [key: string]: any }) {
    /* (Properties) */
    this.notes = this.readNotes(raw);

    /* (Parameters) */
    if (raw.parameters !== undefined) {
      const rawParameters: { [key: string]: any }[] = raw.parameters;

      /*
       * (To prevent deep-logic issues, check to see if Rosetta's parameters match the length of
       *  the overriding parameters. If not, this is the fault of the patch, not Rosetta)
       */
      if (this.parameters.length !== rawParameters.length) {
        throw new Error(
          `The lua function ${this.name}'s parameters does not match the parameters to override. (method: ${this.parameters.length}, given: ${rawParameters.length})`,
        );
      }

      for (let index = 0; index < this.parameters.length; index++) {
        this.parameters[index].parse(rawParameters[index]);
      }
    }

    /* (Returns) */
    if (raw.returns === undefined) {
      throw new Error(`Lua function does not have returns definition: ${this.name}`);
    }
    this.returns.parse(raw.returns);
  }

  toJSON(patch: boolean = false): any {
    const { name, deprecated, notes, parameters, returns } = this;

    const json: any = {};

    /* (Properties) */
    json.deprecated = this.deprecated ? true : undefined;
    json.notes = notes !== undefined && notes !== '' ? notes : undefined;

    /* (Parameters) */
    if (parameters.length) {
      json.parameters = [];
      for (const parameter of parameters) json.parameters.push(parameter.toJSON(patch));
    }

    /* (Returns) */
    json.returns = returns.toJSON(patch);

    return json;
  }
}

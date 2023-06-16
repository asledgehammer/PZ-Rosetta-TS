import * as Assert from '../../Assert';

import { RosettaEntity } from '../RosettaEntity';
import { RosettaJavaParameter } from './RosettaJavaParameter';

import { RosettaJavaClass } from './RosettaJavaClass';

export class RosettaJavaConstructor extends RosettaEntity {
  readonly parameters: RosettaJavaParameter[] = [];

  readonly clazz: RosettaJavaClass;
  readonly deprecated: boolean;
  readonly modifiers: string[];

  notes: string | undefined;

  constructor(clazz: RosettaJavaClass, raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonNull(clazz, 'clazz');

    /* PROPERTIES */
    this.clazz = clazz;
    this.deprecated = this.readBoolean('deprecated') != null;
    this.modifiers = this.readModifiers();

    /* PARAMETERS */
    if (raw['parameters'] !== undefined) {
      const rawParameters: { [key: string]: any }[] = raw['parameters'];
      for (const rawParameter of rawParameters) {
        const parameter = new RosettaJavaParameter(rawParameter);
        this.parameters.push(parameter);
      }
    }
    this.notes = this.readNotes(raw);
  }

  parse(raw: { [key: string]: any }) {
    this.notes = this.readNotes(raw);

    /* PARAMETERS */
    if (raw['parameters'] !== undefined) {
      const rawParameters: { [key: string]: any }[] = raw['parameters'];

      /*
       * (To prevent deep-logic issues, check to see if Rosetta's parameters match the length of
       *  the overriding parameters. If not, this is the fault of the patch, not Rosetta)
       */
      if (this.parameters.length !== rawParameters.length) {
        throw new Error(
          `The class ${this.clazz.name}'s constructor's parameters does not match the parameters to override. (method: ${this.parameters.length}, given: ${rawParameters.length})`,
        );
      }

      for (let index = 0; index < rawParameters.length; index++) {
        let parameter = this.parameters[index];
        parameter.parse(rawParameters[index]);
      }
    }
  }
}

import { JSONSerializable } from '../../../JSONSerializable';
import { isEmptyObject } from '../../RosettaUtils';
import { RosettaJavaConstructor } from '../RosettaJavaConstructor';
import { JavaParameterPatch } from './JavaParameterPatch';

/**
 * **JavaConstructorPatch**
 *
 * @author Jab
 */
export class JavaConstructorPatch implements JSONSerializable {
  notes: string | undefined;
  parameters: JavaParameterPatch[] = [];

  constructor(arg: RosettaJavaConstructor | { [key: string]: any }) {
    if (arg.notes !== undefined && arg.notes !== '') this.notes = arg.notes;

    /* (Parameters) */
    if (arg.parameters !== undefined) {
      for (const parameter of arg.parameters) {
        this.parameters.push(new JavaParameterPatch(parameter));
      }
    }
  }

  toJSON(): any {
    const { notes, parameters } = this;

    const json: any = {};

    /* (Parameters) */
    const jParameters = parameters.length ? parameters.map((p) => p.toJSON()) : undefined;
    if (!isEmptyObject(jParameters)) {
      json.parameters = jParameters;
    }

    if (notes !== undefined && notes !== '') {
      json.notes = notes;
    }

    return json;
  }
}

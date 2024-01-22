import * as Assert from '../../../Assert';
import { JSONSerializable } from '../../../JSONSerializable';
import { isEmptyObject } from '../../RosettaUtils';
import { RosettaJavaMethod } from '../RosettaJavaMethod';
import { JavaParameterPatch } from './JavaParameterPatch';
import { JavaReturnsPatch } from './JavaReturnsPatch';

/**
 * **JavaMethodPatch**
 *
 * @author Jab
 */
export class JavaMethodPatch implements JSONSerializable {
  readonly name: string;
  notes: string | undefined;
  parameters: JavaParameterPatch[] = [];
  returns: JavaReturnsPatch;

  constructor(arg: RosettaJavaMethod | { [key: string]: any }) {
    Assert.assertNonEmptyString(arg.name, 'arg.name');
    Assert.assertNonNull(arg.returns, 'args.returns');

    this.name = arg.name;

    /* (Parameters) */
    for (const parameter of arg.parameters) {
      this.parameters.push(new JavaParameterPatch(parameter));
    }

    /* (Returns) */
    this.returns = new JavaReturnsPatch(arg.returns);
  }

  toJSON(): any {
    const { name, notes, parameters, returns } = this;

    const json: any = {};

    if (notes !== undefined && notes !== '') {
      json.notes = notes;
    }

    const jParameters = parameters.length ? parameters.map((p) => p.toJSON()) : undefined;
    if (!isEmptyObject(jParameters)) {
      json.parameters = jParameters;
    }

    const jReturns = returns.toJSON();
    if (!isEmptyObject(jReturns)) {
      json.returns = jReturns;
    }

    if (!isEmptyObject(json)) {
      json.name = name;
    }

    return json;
  }
}

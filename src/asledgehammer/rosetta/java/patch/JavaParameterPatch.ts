import * as Assert from '../../../Assert';
import { JSONSerializable } from '../../../JSONSerializable';
import { RosettaJavaParameter } from '../RosettaJavaParameter';

/**
 * **JavaParameterPatch**
 *
 * @author Jab
 */
export class JavaParameterPatch implements JSONSerializable {
  readonly type: string;
  name: string | undefined;
  notes: string | undefined;

  constructor(arg: RosettaJavaParameter | { [key: string]: any }) {
    const type = arg instanceof RosettaJavaParameter ? arg.type.basic : arg.type;

    Assert.assertNonEmptyString(type, 'type');

    this.type = type;
    this.name = arg.name;
    this.notes = arg.notes !== undefined && arg.notes !== '' ? arg.notes : undefined;
  }

  toJSON(): any {
    const { type, name, notes } = this;

    return {
      type,
      name: name !== undefined && name !== '' ? name : undefined,
      notes: notes !== undefined && notes !== '' ? notes : undefined,
    };
  }
}

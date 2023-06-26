import { JSONSerializable } from '../../../JSONSerializable';
import { RosettaJavaField } from '../RosettaJavaField';

/**
 * **JavaFieldPatch**
 *
 * @author Jab
 */
export class JavaFieldPatch implements JSONSerializable {
  notes: string | undefined;

  constructor(arg: RosettaJavaField | { [key: string]: any }) {
    if (arg instanceof RosettaJavaField) {
      /* (Handle as new instance from original object) */
    } else {
      /* (Handle as loaded from JSON) */
      this.notes = arg.notes;
    }
  }

  toJSON(): any {
    const { notes } = this;

    const json: any = {};
    if (notes !== undefined && notes !== '') {
      json.notes = notes;
    }

    return json;
  }
}

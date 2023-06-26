import { JSONSerializable } from '../../../JSONSerializable';
import { RosettaJavaReturns } from '../RosettaJavaReturns';

/**
 * **JavaReturnsPatch**
 *
 * @author Jab
 */
export class JavaReturnsPatch implements JSONSerializable {
  notes: string | undefined;

  constructor(arg: RosettaJavaReturns | { [key: string]: any }) {
    if (arg.notes !== undefined && arg.notes !== '') {
      this.notes = arg.notes;
    }
  }

  toJSON(): any {
    const { notes } = this;

    const json: any = {};

    if (this.notes !== undefined && this.notes !== '') {
      json.notes = notes;
    }
    return json;
  }
}

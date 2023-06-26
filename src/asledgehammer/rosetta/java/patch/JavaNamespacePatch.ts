import * as Assert from '../../../Assert';

import { JSONSerializable } from '../../../JSONSerializable';
import { RosettaJavaNamespace } from '../RosettaJavaNamespace';
import { JavaClassPatch } from './JavaClassPatch';

/**
 * **JavaNamespacePatch**
 *
 * @author Jab
 */
export class JavaNamespacePatch implements JSONSerializable {
  readonly name: string;
  readonly classes: { [name: string]: JavaClassPatch } = {};

  constructor(arg: RosettaJavaNamespace | { [key: string]: any }) {
    Assert.assertNonEmptyString(arg.name, 'arg.name');

    this.name = arg.name;

    /* (Classes) */
    if (arg instanceof RosettaJavaNamespace) {
      const keys = Object.keys(arg.classes);
      if (keys.length) {
        keys.sort((a, b) => a.localeCompare(b));
        for (const key of keys) {
          this.classes[key] = new JavaClassPatch(this.name, arg.classes[key]);
        }
      }
    } else {
      const keys = Object.keys(arg);
      if (keys.length) {
        keys.sort((a, b) => a.localeCompare(b));
        for (const key of keys) {
          if (key === 'name') continue;
          this.classes[key] = new JavaClassPatch(this.name, arg[key]);
        }
      }
    }
  }

  toJSON(): any {
    const { classes } = this;

    const json: any = {};

    const keys = Object.keys(classes);
    if (keys.length) {
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        json[key] = classes[key].toJSON();
      }
    }

    return json;
  }
}

import * as Assert from '../../Assert';

import { RosettaEntity } from '../RosettaEntity';

import { RosettaJavaClass } from './RosettaJavaClass';

export class RosettaJavaNamespace extends RosettaEntity {
  readonly classes: { [id: string]: RosettaJavaClass } = {};
  readonly name: string;

  constructor(name: string, raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonEmptyString(name, 'name');
    this.name = name;
    this.parse(raw);
  }

  parse(raw: { [key: string]: any }) {
    /* (Classes) */
    for (const clazzName of Object.keys(raw)) {
      const rawClazz = raw[clazzName];
      let clazz = this.classes[clazzName];
      if (clazz == undefined) {
        clazz = new RosettaJavaClass(clazzName, rawClazz);
      } else {
        clazz.parse(rawClazz);
      }

      if (this.classes[clazzName] !== undefined) {
        throw new Error(`Duplicate class definition: ${clazzName}`);
      }

      /* (Formatted Class Name) */
      this.classes[clazz.name] = this.classes[clazzName] = clazz;
    }
  }
}

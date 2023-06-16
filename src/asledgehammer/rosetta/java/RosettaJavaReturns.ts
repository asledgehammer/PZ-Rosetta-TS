import * as Assert from '../../Assert';

import { RosettaEntity } from '../RosettaEntity';
import { RosettaJavaType } from './RosettaJavaType';

export class RosettaJavaReturns extends RosettaEntity {
  readonly type: RosettaJavaType;
  notes: string | undefined;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonNull(raw['type'], 'raw[type]');

    this.type = new RosettaJavaType(raw['type']);
    this.parse(raw);
  }

  parse(raw: { [key: string]: any }) {
    this.notes = this.readNotes(raw);
  }
}

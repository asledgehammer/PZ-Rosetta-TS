import * as Assert from '../../Assert';

import { RosettaEntity } from '../RosettaEntity';
import { RosettaJavaType } from './RosettaJavaType';
import { formatName } from '../RosettaUtils';

export class RosettaJavaParameter extends RosettaEntity {
  readonly type: RosettaJavaType;
  readonly name: string;

  notes: string | undefined;

  constructor(raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonNull(raw['type'], 'raw[type]');

    this.name = formatName(this.readRequiredString('name'));
    this.type = new RosettaJavaType(raw['type']);
    this.parse(raw);
  }

  parse(raw: { [key: string]: any }) {
    this.notes = this.readNotes(raw);
  }
}

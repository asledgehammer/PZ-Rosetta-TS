import * as Assert from '../../Assert';
import { RosettaEntity } from '../RosettaEntity';
import { RosettaJavaType } from './RosettaJavaType';

export class RosettaJavaField extends RosettaEntity {
  readonly name: string;
  readonly modifiers: string[];
  readonly type: RosettaJavaType;
  readonly deprecated: boolean | undefined;

  notes: string | undefined;

  constructor(name: string, raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonEmptyString(name, 'name');
    Assert.assertNonNull(raw.type, 'raw.type');

    this.name = name;
    this.modifiers = this.readModifiers();
    this.type = new RosettaJavaType(raw.type);
    this.deprecated = this.readBoolean('deprecated') != null;
    this.notes = this.readNotes();
  }

  parse(raw: { [key: string]: any }) {
    this.notes = this.readNotes(raw);
  }
}

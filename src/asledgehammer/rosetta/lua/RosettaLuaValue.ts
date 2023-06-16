import * as Assert from '../../Assert';

import { RosettaEntity } from '../RosettaEntity';
import { formatName } from '../RosettaUtils';

export class RosettaLuaValue extends RosettaEntity {
  readonly name: string;
  type: string;
  notes: string | undefined;

  constructor(name: string, raw: { [key: string]: any }) {
    super(raw);

    Assert.assertNonEmptyString(name, 'name');
    this.name = formatName(name);

    if (raw['type'] != undefined) {
      let type = this.readString('type');
      if (type == undefined) type = 'any';
      this.type = type;
    } else {
      this.type = 'any';
    }

    this.notes = this.readNotes();
  }

  parse(raw: { [key: string]: any }) {
    /* (Properties) */
    this.notes = this.readNotes(raw);
    if (raw['type'] != undefined) {
      this.type = this.readRequiredString('type', raw);
    }
  }
}
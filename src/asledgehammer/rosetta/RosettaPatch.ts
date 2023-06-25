import * as fs from 'fs';
import * as YAML from 'yaml';

import { getFilesFromDir } from './RosettaUtils';

import { Rosetta } from './Rosetta';
import { RosettaFile } from './RosettaFile';
import { RosettaPatchConfiguration } from './RosettaPatchConfiguration';
import { RosettaFileInfo } from './RosettaFileInfo';

export class RosettaPatch {
  /** (Patch Files) */
  readonly files: { [path: string]: RosettaFile } = {};

  readonly rosetta: Rosetta;

  /** The ID of the patch. This is used to locate the patch's root folder and identify the patch inside of Rosetta. */
  readonly id: string;

  /** All the configuration for the patch goes here. */
  readonly config: RosettaPatchConfiguration;

  /* (Generated Fields) */
  readonly path: string;

  /**
   * @param rosetta The instance of Rosetta.
   * @param id The ID of the patch. This is used to locate the patch's root folder and identify the patch inside of
   * Rosetta.
   * @param config All the configuration for the patch goes here.
   */
  constructor(rosetta: Rosetta, id: string, config: RosettaPatchConfiguration) {
    this.rosetta = rosetta;

    this.id = id;
    this.config = { ...config }; // (Sanitize-Check to prevent poisoning)
    this.config.authors = [...this.config.authors]; // (Sanitize-Check to prevent poisoning)

    const path = (this.path = `${rosetta.dir}/patches/${id}`);
    const pathPatchJSON = `${path}/patch.json`;

    if (!fs.existsSync(pathPatchJSON)) {
      // Create the patch folder.
      fs.mkdirSync(path);

      // Create 'patch.json' from options.
      fs.writeFileSync(
        pathPatchJSON,
        JSON.stringify(
          {
            name: config.name,
            version: config.version,
            authors: config.authors,
            description: config.description,
            priority: config.priority,
          },
          null,
          4,
        ),
      );

      // Create the JSON folder to store the patch contents.
      fs.mkdirSync(`${path}/json`);
    }
  }

  /**
   * Loads the contents of the patch.
   *
   * **WARNING**: If any collisions occur within both the `/json/` and `/yml/` directories, the `/yml/` contents
   * will take priority.
   */
  load() {
    this.loadJSON();
    this.loadYAML();
  }

  private loadJSON() {
    const pathJSON = `${this.path}/json`;
    if (fs.existsSync(pathJSON)) {
      const files = getFilesFromDir(pathJSON);
      for (const file of files) {
        const stats = fs.statSync(file);
        if (stats.isDirectory()) continue;
        const json = `${fs.readFileSync(file)}`;
        const fileInfo: RosettaFileInfo = { uri: file, type: 'json' };
        const raw = JSON.parse(json);
        const rFile = new RosettaFile(this.rosetta, fileInfo, raw, false);

        let path = file.toLowerCase();
        // Remove the file extension for the path ID.
        if (path.indexOf('.') !== -1) {
          const split = path.split('.');
          split.pop();
          path = split.join('.');
        }

        this.files[path] = rFile;
      }
    }
  }

  private loadYAML() {
    const pathYAML = `${this.path}/yml`;
    if (fs.existsSync(pathYAML)) {
      const files = getFilesFromDir(pathYAML);
      for (const file of files) {
        const stats = fs.statSync(file);
        if (stats.isDirectory()) continue;
        const yaml = `${fs.readFileSync(file)}`;
        const fileInfo: RosettaFileInfo = { uri: file, type: 'yml' };
        const raw = YAML.parse(yaml);
        const rFile = new RosettaFile(this.rosetta, fileInfo, raw, false);

        let path = file.toLowerCase();
        // Remove the file extension for the path ID.
        if (path.indexOf('.') !== -1) {
          const split = path.split('.');
          split.pop();
          path = split.join('.');
        }

        this.files[path] = rFile;
      }
    }
  }

  /**
   * Saves all the contents of the patch.
   *
   * @param config If true, the configuration for the patch will save to its respective file, depending on if the file
   * is a json file or a yml file.
   */
  save(config: boolean = false) {
    if (config) this.saveConfig();
    this.saveFiles();
  }

  /**
   * Saves the config properties of the patch to either:
   * - **patch.json** (If it exists or no patch config file exists)
   * - **patch.yml** (If no patch.json file exists and a patch.yml file exists)
   */
  private saveConfig() {
    const { rosetta, id, config } = this;

    const dir = `${rosetta.dir}/patches/${id}`;
    const json = () => fs.writeFileSync(`${dir}/patch.json`, JSON.stringify(config, null, 4));
    const yaml = () => fs.writeFileSync(`${dir}/patch.yml`, YAML.stringify(config));
    if (fs.existsSync(`${dir}/patch.json`)) json(); // JSON takes priority.
    else if (fs.existsSync(`${dir}/patch.yml`)) yaml(); // YAML is optional alternative.
    else json(); // Defaults to JSON.
  }

  private saveFiles() {
    const { rosetta, id, files } = this;
    const parentDir = `${rosetta.dir}/patches/${id}`;
    const keys = Object.keys(files);
    for (const key of keys) files[key].save(parentDir, true);
  }

  /**
   * Creates a file, identified by its relative path.
   *
   * @param info
   * @returns
   */
  createFile(info: RosettaFileInfo): RosettaFile {
    const file = new RosettaFile(this.rosetta, info, {}, false);
    this.files[file.id] = file;
    return file;
  }

  /**
   * @param path The file's identifier. (See {@link RosettaFile.asFileID() RosettaFile.asFileID(path)} for more info)
   * @returns The file in the patch. (If exists)
   */
  getFile(path: string): RosettaFile | undefined {
    return this.files[RosettaFile.asFileID(path)];
  }

  /**
   * Reads the parsed contents of a 'patch.json' file, poly-filling missing settings with default values.
   *
   * Loads either:
   * - **patch.json** (If it exists or no patch config file exists)
   * - **patch.yml** (If no patch.json file exists and a patch.yml file exists)
   *
   * Default values:
   * - name: The ID of the patch
   * - version: 1.0.0
   * - authors: A empty string[]
   * - description: A empty string
   * - priority: 1
   *
   * @param id The ID of the patch.
   * @param path The path to the `patch.json` file.
   * @returns The patch.json data along with default settings for those not defined.
   */
  static readConfig(id: string, path: string): RosettaPatchConfiguration {
    // Read from the json with default values.

    const pathJSON = `${path}/patch.json`;
    const pathYML = `${path}/patch.yml`;

    let patch: any;
    if (fs.existsSync(pathJSON)) {
      patch = JSON.parse(fs.readFileSync(pathJSON).toString());
    } else if (fs.existsSync(pathYML)) {
      patch = YAML.parse(fs.readFileSync(pathYML).toString());
    } else {
      return {
        name: id,
        version: `1.0.0`,
        authors: [],
        description: '',
        priority: 1,
      };
    }

    return {
      name: patch.name !== undefined ? patch.name.toString() : `${id}`,
      version: patch.version !== undefined ? patch.version.toString() : '1.0.0',
      authors: patch.authors !== undefined ? patch.authors : [],
      description: patch.description !== undefined ? patch.description : '',
      priority: patch.priority !== undefined ? parseInt(patch.priority.toString()) : 1,
    };
  }
}

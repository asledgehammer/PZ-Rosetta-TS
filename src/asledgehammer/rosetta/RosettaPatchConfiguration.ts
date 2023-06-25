/**
 * **RosettaPatchConfiguration** stores Configurations for Rosetta Patches.
 *
 * @author Jab
 */
export type RosettaPatchConfiguration = {
  /** The formal name of the patch. */
  name: string;

  /** The version of the patch. */
  version: string;

  /** A description of the patch and what it patches. */
  description: string;

  /** The author(s) of the patch. */
  authors: string[];

  /** The load priority of the patch. (The smaller the number, the quicker the patch loads) */
  priority: number;
};

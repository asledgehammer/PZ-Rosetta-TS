import * as Assert from '../../../Assert';
import { JavaMethodPatch } from './JavaMethodPatch';

/**
 * **JavaMethodPatchCluster**
 *
 * @author Jab
 */
export class JavaMethodPatchCluster {
  readonly methods: JavaMethodPatch[] = [];
  readonly name: string;

  constructor(name: string) {
    Assert.assertNonEmptyString(name, 'name');
    this.name = name;
  }

  getWithParameters(...parameterNames: string[]): JavaMethodPatch | undefined {
    for (const method of this.methods) {
      const parameters = method.parameters;
      if (parameterNames.length === parameters.length) {
        if (parameterNames.length === 0) return method;
        let invalid = false;
        for (let i = 0; i < parameters.length; i++) {
          if (parameters[i].name !== parameterNames[i]) {
            invalid = true;
            break;
          }
        }
        if (invalid) continue;
        return method;
      }
    }
  }

  add(method: JavaMethodPatch) {
    this.methods.push(method);
  }
}

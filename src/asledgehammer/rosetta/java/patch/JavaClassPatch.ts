import * as Assert from '../../../Assert';

import { JSONSerializable } from '../../../JSONSerializable';
import { isEmptyObject } from '../../RosettaUtils';
import { RosettaJavaClass } from '../RosettaJavaClass';
import { JavaConstructorPatch } from './JavaConstructorPatch';
import { JavaFieldPatch } from './JavaFieldPatch';
import { JavaMethodPatch } from './JavaMethodPatch';
import { JavaMethodPatchCluster } from './JavaMethodPatchCluster';

/**
 * **JavaClassPatch**
 *
 * @author Jab
 */
export class JavaClassPatch implements JSONSerializable {
  notes: string | undefined;
  methods: { [name: string]: JavaMethodPatchCluster } = {};
  fields: { [name: string]: JavaFieldPatch } = {};
  constructors: JavaConstructorPatch[] = [];
  namespace: string;

  constructor(namespace: string, arg: RosettaJavaClass | { [key: string]: any }) {
    Assert.assertNonEmptyString(namespace, 'namespace');

    this.namespace = namespace;

    /* (Fields) */
    if (arg.fields !== undefined) {
      for (const key of Object.keys(arg.fields)) {
        this.fields[key] = new JavaFieldPatch(arg.fields[key]);
      }
    }

    /* (Constructors) */
    if (arg.constructors !== undefined) {
      for (const conztructor of arg.constructors) {
        this.constructors.push(new JavaConstructorPatch(conztructor));
      }
    }

    /* (Methods) */
    if (arg instanceof RosettaJavaClass) {
      const keys = Object.keys(arg.methods);
      if (keys.length) {
        for (const key of keys) {
          const cluster = arg.methods[key];
          this.methods[key] = new JavaMethodPatchCluster(cluster.name);
          for (const method of cluster.methods) {
            this.methods[key].add(new JavaMethodPatch(method));
          }
        }
      }
    } else {
      if (arg.methods !== undefined) {
        /* (Explode as Method Clusters) */
        for (const method of arg.methods) {
          const methodName = method.name;
          let cluster = this.methods[methodName];
          if (cluster === undefined) {
            this.methods[methodName] = cluster = new JavaMethodPatchCluster(methodName);
          }
          cluster.add(method);
        }
      }
    }
  }

  toJSON(): any {
    const { notes, methods, fields, constructors } = this;

    const json: any = {};
    if (notes !== undefined && notes !== '') {
      json.notes = notes;
    }

    /* (Fields) */
    let keys = Object.keys(fields);
    if (keys.length) {
      keys.sort((a, b) => a.localeCompare(b));

      const jFields: any = {};
      for (const key of keys) {
        const jField = fields[key].toJSON();
        if (!isEmptyObject(jField)) jFields[key] = jField;
      }

      if (!isEmptyObject(jFields)) json.fields = jFields;
    }

    /* (Constructors) */
    if (constructors.length) {
      const jConstructors = [];
      for (const conztructor of constructors) {
        const jConstructor = conztructor.toJSON();
        if (!isEmptyObject(jConstructor)) jConstructors.push(jConstructor);
      }
      if (jConstructors.length !== 0) {
        json.constructors = jConstructors;
      }
    }

    /* (Methods) */
    keys = Object.keys(methods);
    if (keys.length) {
      const jMethods = [];
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        /* (Squash MethodClusters as Method arrays) */
        const cluster = methods[key];
        cluster.methods.sort((a, b) => a.parameters.length - b.parameters.length);
        for (const method of cluster.methods) {
          const jMethod = method.toJSON();
          if (!isEmptyObject(jMethod)) jMethods.push(jMethod);
        }
      }

      if (jMethods.length !== 0) json.methods = jMethods;
    }

    return json;
  }
}

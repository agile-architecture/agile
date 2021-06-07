import React from 'react';
import {
  Agile,
  Collection,
  getAgileInstance,
  Group,
  extractObservers,
  Observer,
  State,
  SubscriptionContainerKeyType,
  defineConfig,
  isValidObject,
  generateId,
  ProxyWeakMapType,
  ComponentIdType,
} from '@agile-ts/core';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { ProxyTree } from '@agile-ts/proxytree';

//=========================================================================================================
// useAgile
//=========================================================================================================
/**
 * React Hook that binds Agile Instances like Collections, States, Computeds, .. to a React Functional Component
 * @param deps - Agile Instances that will be subscribed to this Component
 * @param config - Config
 */
export function useAgile<X extends Array<SubscribableAgileInstancesType>>(
  deps: X | [],
  config?: AgileHookConfigInterface
): AgileHookArrayType<X>;

/**
 * React Hook that binds Agile Instance like Collection, State, Computed, .. to a React Functional Component
 * @param dep - Agile Instance that will be subscribed to this Component
 * @param config - Config
 */
export function useAgile<X extends SubscribableAgileInstancesType>(
  dep: X,
  config?: AgileHookConfigInterface
): AgileHookType<X>;

export function useAgile<
  X extends Array<SubscribableAgileInstancesType>,
  Y extends SubscribableAgileInstancesType
>(
  deps: X | Y,
  config: AgileHookConfigInterface = {}
): AgileHookArrayType<X> | AgileHookType<Y> {
  const depsArray = extractObservers(deps);
  const proxyTreeWeakMap = new WeakMap();
  config = defineConfig(config, {
    proxyBased: false,
    key: generateId(),
    agileInstance: null,
  });

  // Creates Return Value of Hook, depending whether deps are in Array shape or not
  const getReturnValue = (
    depsArray: (Observer | undefined)[]
  ): AgileHookArrayType<X> | AgileHookType<Y> => {
    const handleReturn = (dep: Observer | undefined): AgileHookType<Y> => {
      if (dep == null) return undefined as any;
      const value = dep.value;

      // If proxyBased and value is of type object.
      // Wrap a Proxy around the object to track the used properties
      if (config.proxyBased && isValidObject(value, true)) {
        const proxyTree = new ProxyTree(value);
        proxyTreeWeakMap.set(dep, proxyTree);
        return proxyTree.proxy;
      }

      return value;
    };

    // Handle single dep
    if (depsArray.length === 1 && !Array.isArray(deps)) {
      return handleReturn(depsArray[0]);
    }

    // Handle deps array
    return depsArray.map((dep) => {
      return handleReturn(dep);
    }) as AgileHookArrayType<X>;
  };

  // Trigger State, used to force Component to rerender
  const [, forceRender] = React.useReducer((s) => s + 1, 0);

  useIsomorphicLayoutEffect(() => {
    let agileInstance = config.agileInstance;

    // Try to get Agile Instance
    if (!agileInstance) agileInstance = getAgileInstance(depsArray[0]);
    if (!agileInstance || !agileInstance.subController) {
      Agile.logger.error(
        'Failed to subscribe Component with deps because of missing valid Agile Instance.',
        deps
      );
      return;
    }

    // https://github.com/microsoft/TypeScript/issues/20812
    const observers: Observer[] = depsArray.filter(
      (dep): dep is Observer => dep !== undefined
    );

    // Build Proxy Path WeakMap Map based on the Proxy Tree WeakMap
    // by extracting the routes of the Tree
    // Building the Path WeakMap in the 'useIsomorphicLayoutEffect'
    // because the 'useIsomorphicLayoutEffect' is called after the rerender
    // -> In the Component used paths got successfully tracked
    const proxyWeakMap: ProxyWeakMapType = new WeakMap();
    if (config.proxyBased) {
      for (const observer of observers) {
        const proxyTree = proxyTreeWeakMap.get(observer);
        if (proxyTree != null) {
          proxyWeakMap.set(observer, {
            paths: proxyTree.getUsedRoutes() as any,
          });
        }
      }
    }

    // Create Callback based Subscription
    const subscriptionContainer = agileInstance.subController.subscribeWithSubsArray(
      () => {
        forceRender();
      },
      observers,
      {
        key: config.key,
        proxyWeakMap,
        waitForMount: false,
        componentId: config.componentId,
      }
    );

    // Unsubscribe Callback based Subscription on Unmount
    return () => {
      agileInstance?.subController.unsubscribe(subscriptionContainer);
    };
  }, []);

  return getReturnValue(depsArray);
}

// Array Type
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html
export type AgileHookArrayType<T> = {
  [K in keyof T]: T[K] extends Collection<infer U> | Group<infer U>
    ? U[]
    : T[K] extends State<infer U> | Observer<infer U>
    ? U
    : T[K] extends undefined
    ? undefined
    : T[K] extends Collection<infer U> | Group<infer U> | undefined
    ? U[] | undefined
    : T[K] extends State<infer U> | Observer<infer U> | undefined
    ? U | undefined
    : never;
};

// No Array Type
export type AgileHookType<T> = T extends Collection<infer U> | Group<infer U>
  ? U[]
  : T extends State<infer U> | Observer<infer U>
  ? U
  : T extends undefined
  ? undefined
  : T extends Collection<infer U> | Group<infer U> | undefined
  ? U[] | undefined
  : T extends State<infer U> | Observer<infer U> | undefined
  ? U | undefined
  : never;

export type SubscribableAgileInstancesType =
  | State
  | Collection<any> //https://stackoverflow.com/questions/66987727/type-classa-id-number-name-string-is-not-assignable-to-type-classar
  | Observer
  | undefined;

/**
 * @param key - Key/Name of SubscriptionContainer that is created
 * @param agileInstance - Instance of Agile
 * @param proxyBased - If useAgile() should only rerender the Component when a used property mutates
 */
interface AgileHookConfigInterface {
  key?: SubscriptionContainerKeyType;
  agileInstance?: Agile;
  proxyBased?: boolean;
  componentId?: ComponentIdType;
}

interface ProxyTreeMapInterface {
  [key: string]: ProxyTree;
}

import Agile, { Integration } from '@agile-ts/core';
import Vue from 'vue';
import { bindAgileInstances, DepsType } from './bindAgileInstances';

// https://vuejs.org/v2/guide/typescript.html
declare module 'vue/types/vue' {
  interface VueConstructor {
    bindAgileInstances: (deps: DepsType) => { [key: string]: any };
    $agile: Agile;
  }
}

const vueIntegration = new Integration<typeof Vue, Vue>({
  key: 'vue',
  frameworkInstance: Vue,
  updateMethod: (componentInstance, updatedData) => {
    const componentData = componentInstance.$data;

    // Update existing Data or if a new one got created set it via Vue
    // Note: Not merging 'updateData' into 'componentData'
    // because Vue tracks the local State changes via Proxy
    // and by merging it, Vue can't detect the changes
    for (const key of Object.keys(updatedData)) {
      if (Object.prototype.hasOwnProperty.call(componentData, key)) {
        componentData.sharedState[key] = updatedData[key];
      } else {
        // https://vuejs.org/v2/guide/reactivity.html
        Vue.set(componentData.sharedState, key, updatedData[key]);
      }
    }
  },
  bind: (agile) => {
    // https://vuejs.org/v2/guide/plugins.html
    Vue.use({
      install: (vue) => {
        // https://vuejs.org/v2/guide/mixins.html
        vue.mixin({
          created: function () {
            // @ts-ignore
            this.$agile = agile;
          },
          methods: {
            // TODO make 'bindAgileValues' ('sharedState') more typesafe
            bindAgileValues: function (
              deps: DepsType
            ): { sharedState: { [key: string]: any } } {
              return {
                sharedState: {
                  ...(this?.$data?.sharedState || {}),
                  ...bindAgileInstances(deps, agile, this, 'value'),
                },
              };
            },
            // TODO make 'bindAgileOutputs' ('sharedState') more typesafe
            bindAgileOutputs: function (
              deps: DepsType
            ): { sharedState: { [key: string]: any } } {
              return {
                sharedState: {
                  ...(this?.$data?.sharedState || {}),
                  ...bindAgileInstances(deps, agile, this, 'output'),
                },
              };
            },
          },
        });
      },
    });
    return Promise.resolve(true);
  },
});
Agile.initialIntegrations.push(vueIntegration);

export default vueIntegration;

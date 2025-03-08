import "vue";

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  // 为 Vue 实例扩展全局属性
  interface ComponentCustomProperties {
    $$: $$;
  }
}
declare module "*.scss" {
  const scss: Record<string, string>;
  export default scss;
}

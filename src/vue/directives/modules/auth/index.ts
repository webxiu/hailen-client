import type { Directive, DirectiveBinding } from "vue";

import { hasAuth } from "@/vue/router";

export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    if (value) {
      !hasAuth(value) && el.parentNode?.removeChild(el);
    } else {
      throw new Error("[Directive: auth]: need auths! Like v-auth=\"['btn.add','btn.edit']\"");
    }
  }
};

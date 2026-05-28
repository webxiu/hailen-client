import { defineStore } from "pinia";
import { store } from "@/vue/store";

interface TagType {
  tagList: any[];
}

export const useTagStore = defineStore({
  id: "hx-tag",
  state: (): TagType => ({
    tagList: []
  }),
  getters: {
    getTagList(state) {
      return state.tagList;
    }
  },
  actions: {
    addTag(item) {
      const index = this.tagList.findIndex((f) => f.path === item.path);
      if (index > -1) return;
      this.tagList = [...this.tagList, item];
    },
    removeTag(item) {
      console.log("删除", item);
      this.tagList = this.tagList.filter((f) => f.path !== item.path);
    }
  }
});

export function useTagStoreHook() {
  return useTagStore(store);
}

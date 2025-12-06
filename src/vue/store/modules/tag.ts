import { defineStore } from "pinia";
import { store } from "@/vue/store";

interface TagType {
  tagList: any[];
}

const tags = new Array(1).fill(0).map((item, index) => {
  const randomIndex = Math.floor(Math.random() * 5 + 5);
  index++;
  return {
    name: `Home${index}`,
    path: `/home/command/mac/index`,
    meta: { title: "主页", icon: "icon-gongzuotai", keepAlive: true },
    id: index,
    query: {
      menuCode: "16",
      from: "/productMkCenter",
      menuId: "146",
      menuName: "李会计"
    }
  };
});

export const useTagStore = defineStore({
  id: "hx-tag",
  state: (): TagType => ({
    tagList: tags
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

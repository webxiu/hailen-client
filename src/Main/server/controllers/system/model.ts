import { Database } from "../../database/db";
import { MenuItemType } from "./types";

export type { MenuItemType };

export default class DbModel {
  private db: Database;
  constructor() {
    this.db = Database.getInstance();
  }

  async createMenu(menus: MenuItemType[]): Promise<boolean> {
    const db = this.db;
    try {
      await db.run("BEGIN TRANSACTION");

      // 1. 查询旧数据
      const oldData: MenuItemType[] = await db.all("SELECT * FROM menus");
      const mergedData = menus.map((menu) => {
        const oldItem = oldData.find((f) => f.path === menu.path) || {};
        return { ...oldItem, ...menu };
      });

      // 3. 清空表（保留表结构）
      await db.run("DELETE FROM menus");

      // 4. 重置自增主键计数器（SQLite 需要）
      await db.run("DELETE FROM sqlite_sequence WHERE name = 'menus'");
      console.log("mergedData", mergedData);
      // 5. 插入合并后的数据（ID 会从 1 开始重新分配）
      for (const item of mergedData) {
        await db.run("INSERT INTO menus (title, path, icon) VALUES (?, ?, ?)", [item.title, item.path, item.icon]);
      }

      await db.run("COMMIT");
      return true;
    } catch (error) {
      await db.run("ROLLBACK");
      console.error("合并数据并重置ID失败:", error);
      return false;
    }
  }

  async getMenu(): Promise<MenuItemType[]> {
    const db = this.db;
    const result = await db.all("SELECT * FROM menus");
    return result as MenuItemType[];
  }
}

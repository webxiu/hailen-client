/*
 * @Author: Hailen
 * @Date: 2025-07-14 09:08:05
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-29 10:01:16
 * @Description:
 */
import { Database, SQLGenerator } from "../../database/db";

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

      // 5. 插入合并后的数据（ID 会从 1 开始重新分配）
      for (const item of mergedData) {
        const { id, parentId, name, title, path, icon, type } = item;
        await db.run("INSERT INTO menus (id, parentId, name, title, path, icon, type) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, parentId, name, title, path, icon, type]);
      }
      await db.run("COMMIT");
      return true;
    } catch (error) {
      await db.run("ROLLBACK");
      console.error("合并数据并重置ID失败:", error);
      return false;
    }
  }

  async getMenu(params): Promise<MenuItemType[]> {
    const db = this.db;
    const { sql, values } = SQLGenerator.select("menus", params, { order: "createDate ASC" });
    console.log("sql", sql, values);
    const result = await db.all(sql, values);
    return result as MenuItemType[];
  }

  async updateMenu(data: { id: number; [key: string]: any }): Promise<boolean> {
    const { id, ...rest } = data;
    if (!id) throw new Error("菜单ID不能为空");

    const keyValues = Object.entries(rest).filter(([_, value]) => value !== undefined);
    if (keyValues.length === 0) throw new Error("没有要更新的字段");

    const hasId = await this.db.get("SELECT id FROM menus WHERE id = ?", [id]);
    if (!hasId) throw new Error(`菜单ID:${id}不存在`);

    const setFields = keyValues.map(([key]) => `${key} = ?`);
    const queryParams = keyValues.map(([_, value]) => value);
    queryParams.push(id); // 添加WHERE条件参数
    const sql = `UPDATE menus SET ${setFields.join(", ")} WHERE id = ?`;
    await this.db.run(sql, queryParams);

    return true;
  }
}

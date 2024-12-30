import { Database } from "../../database/db";
import { User } from "./types";

export type { User };

export default class HomeModel {
  private db: Database;
  constructor() {
    this.db = Database.getInstance({ isDev: false });
  }

  // 获取所有用户
  async findAll(params: Record<string, any>): Promise<User[]> {
    let sql = "SELECT * FROM users WHERE 1=1";
    const queryParams: any[] = [];
    for (const key in params) {
      if (params[key]) {
        sql += ` AND ${key} = ?`;
        queryParams.push(params[key]);
      }
    }
    sql += " ORDER BY created_at DESC";
    return this.db.all<User>(sql, queryParams);
  }
}

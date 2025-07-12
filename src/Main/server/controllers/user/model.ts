import { User, UserItemType } from "./types";

import { Database } from "../../database/db";

export type { User, UserItemType };

export default class DbModel {
  private db: Database;
  constructor() {
    this.db = Database.getInstance();
  }

  async login(user: Pick<User["user"], "email" | "password">): Promise<User["user"] | undefined> {
    const sql = "SELECT * FROM users WHERE email = ?";
    return await this.db.get<User["user"]>(sql, [user.email]);
  }
  async register(user: Omit<User["user"], "id" | "createDate">): Promise<boolean> {
    const sql = `INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)`;
    try {
      await this.db.run(sql, [user.username, user.password, user.email, user.phone]);
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const sql = "SELECT * FROM users WHERE email = ?";
    return this.db.get<User>(sql, [email]);
  }

  // 获取所有用户
  async findAll(params: Record<string, any>): Promise<User[]> {
    // const sql = "SELECT * FROM users WHERE ORDER BY create_date DESC";
    let sql = "SELECT * FROM users WHERE 1=1";
    const queryParams: any[] = [];
    for (const key in params) {
      if (params[key]) {
        sql += ` AND ${key} = ?`;
        queryParams.push(params[key]);
      }
    }
    sql += " ORDER BY create_date DESC";
    return this.db.all<User>(sql, queryParams);
  }
}

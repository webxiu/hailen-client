import { Database } from "../../database/db";
import { User } from "./types";
import bcrypt from "bcrypt";

export type { User };

export default class UserModel {
  private db: Database;
  constructor() {
    this.db = Database.getInstance();
  }

  async login(user: Pick<User, "email" | "password">): Promise<User | undefined> {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    return this.db.get<User>(sql, [user.email, user.password]);
  }
  async register(user: Omit<User, "id" | "created_at">): Promise<boolean> {
    const sql = `INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)`;
    const hashedPassword = await bcrypt.hash(user.password, 10);
    try {
      await this.db.run(sql, [user.username, hashedPassword, user.email, user.phone]);
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
    // const sql = "SELECT * FROM users WHERE ORDER BY created_at DESC";
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

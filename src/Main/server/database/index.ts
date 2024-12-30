// src/main/models/user.ts

import { Database } from "./db";

export interface User {
  id?: number;
  name: string;
  email: string;
  created_at?: string;
}

export class UserModel {
  private db: Database;

  constructor() {
    this.db = Database.getInstance({ isDev: false });
  }

  /**
   * 创建用户
   */
  async create(user: Omit<User, "id" | "created_at">): Promise<User | undefined> {
    const sql = `
      INSERT INTO users (name, email)
      VALUES (?, ?)
    `;

    await this.db.run(sql, [user.name, user.email]);

    return this.findByEmail(user.email);
  }

  /**
   * 通过 ID 查找用户
   */
  async findById(id: number): Promise<User | undefined> {
    const sql = "SELECT * FROM users WHERE id = ?";
    return this.db.get<User>(sql, [id]);
  }

  /**
   * 通过邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const sql = "SELECT * FROM users WHERE email = ?";
    return this.db.get<User>(sql, [email]);
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    const sql = "SELECT * FROM users ORDER BY created_at DESC";
    return this.db.all<User>(sql);
  }

  /**
   * 更新用户信息
   */
  async update(id: number, data: Partial<User>): Promise<void> {
    const fields = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");

    const sql = `UPDATE users SET ${fields} WHERE id = ?`;
    const values = [...Object.values(data), id];

    await this.db.run(sql, values);
  }

  /**
   * 删除用户
   */
  async delete(id: number): Promise<void> {
    const sql = "DELETE FROM users WHERE id = ?";
    await this.db.run(sql, [id]);
  }
}

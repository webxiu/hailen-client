// src/main/database/index.ts

import { printl, tables } from "../config";

import { app } from "electron";
import path from "path";
import sqlite3 from "sqlite3";

export class Database {
  private db: sqlite3.Database;
  private static instance: Database;

  private constructor() {
    // 数据库文件路径
    // const dbPath = path.join(app.getPath("userData"), "database.db");
    let dbPath = path.join(process.cwd(), global.isDev ? "source" : "../source", "database", "database.db");
    if (global.platform !== "darwin") {
      dbPath = path.join(process.cwd(), "source", "database", "database.db");
    }

    // console.log("========是否开发环境:", global);
    printl("数据库文件路径:", dbPath);

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("数据库连接失败:".bgRed, err);
      } else {
        printl("数据库连接成功", "");
        this.init().catch(console.error);
      }
    });
  }

  printl(s1, s2, ...rest) {
    console.log(s1.bgBlue, s2.blue, ...rest, "\n");
  }

  /**
   * 获取数据库实例（单例模式）
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * 初始化数据库表
   */
  private async init(): Promise<void> {
    for (const sql of tables) {
      await this.run(sql);
    }
  }

  /**
   * 运行 SQL 语句
   */
  public async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 执行 SQL 语句
   */
  public async exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 查询单条记录
   */
  public async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  /**
   * 查询多条记录
   */
  public async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  /**
   * 关闭数据库连接
   */
  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
export class SQLGenerator {
  /** 生成查询语句 */
  static select(table, where, options) {
    const { page, pageSize, ...rest } = where;
    const { whereStr, values } = this.getWhere(rest);
    let sql = `SELECT * FROM ${table}${whereStr ? ` WHERE ${whereStr}` : ""}`;

    const pageNum = +page || 1;
    const limit = +pageSize || 30;
    const offset = (pageNum - 1) * pageSize;
    if (options.order) sql += ` ORDER BY ${options.order}`;
    if (pageSize) sql += ` LIMIT ${limit}`;
    if (page) sql += ` OFFSET ${offset}`;
    return { sql, values: values };
  }

  /** 生成插入语句 */
  static inset(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
    return { sql, values };
  }

  /** 生成更新语句 */
  static update(table, data, where) {
    const { whereStr, values } = this.getWhere(where);
    const keys = Object.keys(data);
    const setFields = keys.map((key) => `${key} = ?`).join(", ");
    const queryParams = Object.values(data);
    queryParams.push(...Object.values(where));
    const sql = `UPDATE ${table} SET ${setFields} ${whereStr ? `WHERE ${whereStr}` : ""}`;
    return { sql, values: queryParams };
  }
  /** 生成删除语句 */
  static delete(table, where) {
    const { whereStr, values } = this.getWhere(where);
    const queryParams = Object.values(where);
    const sql = `DELETE FROM ${table} ${whereStr ? `WHERE ${whereStr}` : ""}`;
    return { sql, values: queryParams };
  }

  /** 获取 where 语句 */
  static getWhere(where) {
    const filterFn = (value) => ![undefined, null, ""].includes(value);
    const keys = Object.keys(where).filter((key) => filterFn(where[key]));
    const values = Object.values(where).filter((value) => filterFn(value));
    const whereStr = keys.map((key) => `${key} = ?`).join(" AND ");

    return { whereStr, values };
  }
}

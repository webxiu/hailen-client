// src/main/database/index.ts

import { app } from "electron";
import path from "path";
import { printl } from "../config";
import sqlite3 from "sqlite3";

export class Database {
  private db: sqlite3.Database;
  private static instance: Database;

  private constructor() {
    // 数据库文件路径
    // const dbPath = path.join(app.getPath("userData"), "database.db");
    const dbPath = path.join(process.cwd(), global.isDev ? "source" : "../source", "database", "database.db");

    console.log("========是否开发环境:", global.isDev);
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
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username varchar(50) NOT NULL UNIQUE,
        password varchar(50) NOT NULL,
        email varchar(50) NOT NULL,
        phone varchar(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
      // 其他表...
    ];

    for (const sql of tables) {
      await this.run(sql);
    }
  }

  /**
   * 执行 SQL 语句
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

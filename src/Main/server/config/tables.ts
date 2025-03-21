/** 创建数据库表SQL语句 */
const tables = [
  /* 用户表 */
  `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username varchar(50) NOT NULL UNIQUE,
      password varchar(50) NOT NULL,
      email varchar(50) NOT NULL,
      phone varchar(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  /* 菜单表 */
  `CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title varchar(50) NOT NULL,
      icon varchar(50) NOT NULL,
      path varchar(50) NOT NULL
    )`
  // 其他表...
];

export { tables };

/*
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-27 10:03:26
 * @Description:
 */
import axios from "axios";
import fs from "fs";
import path from "path";

/** 读文件 */
function readFile(path) {
  const data = fs.readFileSync(path);
  const html = data.toString();
  return html;
}

/** 写文件 */
function writeFile(path, data) {
  fs.writeFileSync(path, data, { encoding: "utf-8" });
}

/** 同步递归创建文件夹, 返回文件夹目录 */
function mkdirSync(dirName) {
  if (!dirName) throw new Error("目录不合法");
  if (fs.existsSync(dirName)) {
    return dirName;
  } else {
    if (mkdirSync(path.dirname(dirName))) {
      fs.mkdirSync(dirName);
      return dirName;
    }
  }
}

function getJsonFiles(jsonPath, fn) {
  const jsonFiles = [];
  function findJsonFile(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(function (item) {
      const fPath = path.join(dir, item);
      const stat = fs.statSync(fPath);
      if (stat.isDirectory() === true) {
        findJsonFile(fPath); //目录
      } else if (stat.isFile() === true) {
        if (fn) {
          if (fn(fPath)) jsonFiles.push(fPath);
        } else {
          jsonFiles.push(fPath);
        }
      }
    });
  }
  findJsonFile(jsonPath);
  return jsonFiles;
}

/**
 * 获取路由路径
 * @param dir 根目录
 * @param excludes 排除目录名
 * @param fileFilterFn 文件过滤方法
 */
function getRoutePaths(dir, excludes = [], fileFilterFn) {
  let id = 1;
  const result = [];
  const dirPathToId = new Map();

  // 判断路径是否被排除（基于目录名）
  function isExcluded(p) {
    const parts = p.split(path.sep);
    return parts.some((part) => excludes.includes(part));
  }

  function traverse(currentPath, parentId = 0) {
    let stats;
    try {
      stats = fs.statSync(currentPath);
    } catch (err) {
      return;
    }

    const relativePath = path.relative(dir, currentPath);
    const posixPath = relativePath.split(path.sep).join("/"); // 转为标准路径
    const fullPath = posixPath ? "/" + posixPath : "/";
    if (isExcluded(relativePath)) return;

    if (stats.isDirectory()) {
      const items = fs.readdirSync(currentPath);
      const subDirs = [];
      let hasIndex = false;
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        try {
          const itemStat = fs.statSync(itemPath);
          if (itemStat.isDirectory()) {
            subDirs.push(itemPath);
          } else if (item === "index.vue" && fileFilterFn?.(itemPath)) {
            hasIndex = true;
          }
        } catch (err) {}
      }

      // 如果当前目录有 index.vue，说明它是“叶子菜单”，不作为目录添加
      if (hasIndex) {
        // 读取 index.vue 的 defineOptions({ name: "xxx" , title: "xxx" })
        const fPath = path.join(currentPath, `./index.vue`);
        const code = readFile(fPath);
        const match = code.match(/defineOptions\s*\(\s*({[^}]*})\s*\)/);
        let option = {};
        if (match) {
          const optionsObject = match[1];
          try {
            option = eval(`(${optionsObject})`);
          } catch (e) {}
        }
        result.push({ id: id++, path: `${fullPath}/index`, parentId, type: "菜单", ...option });
        return;
      }
      // 如果没有 index.vue，说明它是“容器目录”，可以添加为目录
      if (fullPath !== "/") {
        const dirId = id++;
        dirPathToId.set(currentPath, dirId);
        result.push({ id: dirId, path: fullPath, parentId, type: "目录" });
        parentId = dirId;
      }
      for (const subDir of subDirs) {
        traverse(subDir, parentId);
      }
    }
  }

  traverse(dir, 0);

  return result;
}

export { readFile, writeFile, mkdirSync, getJsonFiles, getRoutePaths };

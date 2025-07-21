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

export { readFile, writeFile, mkdirSync, getJsonFiles };

import { blue, bold, green } from "picocolors";
import dayjs, { Dayjs } from "dayjs";

import type { Plugin } from "vite";
import duration from "dayjs/plugin/duration";
import fs from "fs";
import path from "path";

dayjs.extend(duration);

export function viteBuildInfo(): Plugin {
  let config: { command: string };
  let startTime: Dayjs;
  let endTime: Dayjs;
  let outDir: string;
  return {
    name: "vite:buildInfo",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      outDir = resolvedConfig.build?.outDir ?? "dist";
    },
    buildStart() {
      console.log(bold(green(`👏项目${blue("运行中")}...`)));
      if (config.command === "build") {
        startTime = dayjs(new Date());
      }
    },
    closeBundle() {
      if (config.command === "build") {
        endTime = dayjs(new Date());
        getPackageSize({
          folder: outDir,
          callback: (size: string) => {
            console.log(bold(green(`🎉恭喜打包完成（总用时${dayjs.duration(endTime.diff(startTime)).format("mm分ss秒")}，打包后的大小为${size}）`)));
          }
        });
      }
    }
  };
}

interface GetPackageSizeOptions {
  folder: string;
  callback: (size: string) => void;
}

export function getPackageSize({ folder, callback }: GetPackageSizeOptions) {
  let totalSize = 0;

  // 递归函数来计算文件夹大小
  function calculateSize(dir: string) {
    // 读取目录中的所有文件和子目录
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(`无法读取目录 ${dir}:`, err);
        return;
      }

      // 处理每个文件和子目录
      let pending = files.length;
      if (pending === 0) {
        // 如果没有文件，直接返回
        callback(formatSize(totalSize));
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`无法获取文件 ${filePath} 的信息:`, err);
          } else {
            if (stats.isDirectory()) {
              // 如果是目录，递归调用
              calculateSize(filePath);
            } else {
              // 如果是文件，累加文件大小
              totalSize += stats.size;
            }
          }

          // 检查是否所有文件都已处理
          pending -= 1;
          if (pending === 0) {
            callback(formatSize(totalSize));
          }
        });
      });
    });
  }

  // 格式化大小为可读格式
  function formatSize(size: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;
    let formattedSize = size;

    while (formattedSize >= 1024 && index < units.length - 1) {
      formattedSize /= 1024;
      index += 1;
    }

    return `${formattedSize.toFixed(2)} ${units[index]}`;
  }

  // 开始计算指定文件夹的大小
  calculateSize(folder);
}

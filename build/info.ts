import { blue, bold, green } from "picocolors";
import dayjs, { Dayjs } from "dayjs";

import type { Plugin } from "vite";
import duration from "dayjs/plugin/duration";
import { readdir, stat } from "fs/promises";
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
    async closeBundle() {
      if (config.command === "build") {
        endTime = dayjs(new Date());
        const size = await getPackageSize(outDir);
        console.log(bold(green(`🎉恭喜打包完成（总用时${dayjs.duration(endTime.diff(startTime)).format("mm分ss秒")}，打包后的大小为${size}）`)));
      }
    }
  };
}

/** 递归统计文件夹总大小, 并格式化为可读格式 */
export async function getPackageSize(folder: string): Promise<string> {
  // 递归统计目录大小(同级条目并行统计)
  async function calculateSize(dir: string): Promise<number> {
    const files = await readdir(dir);
    const sizes = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file);
        try {
          const stats = await stat(filePath);
          // 目录递归统计, 文件直接取大小
          return stats.isDirectory() ? await calculateSize(filePath) : stats.size;
        } catch (err) {
          console.error(`无法获取文件 ${filePath} 的信息:`, err);
          return 0;
        }
      })
    );
    return sizes.reduce((sum, size) => sum + size, 0);
  }

  let totalSize = 0;
  try {
    totalSize = await calculateSize(folder);
  } catch (err) {
    console.error(`无法读取目录 ${folder}:`, err);
    return "未知";
  }

  // 格式化大小为可读格式
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let formattedSize = totalSize;
  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024;
    index += 1;
  }
  return `${formattedSize.toFixed(2)} ${units[index]}`;
}

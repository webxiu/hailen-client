import { loadEnv, type UserConfig } from "vite";

import viteCom from "./vite.com";

/** 当前执行node命令时文件夹的地址（工作目录） */
const root: string = process.cwd();

export default ({ mode }: { mode: string }): UserConfig => {
  const env = loadEnv(mode, root);
  return viteCom("react", env);
};

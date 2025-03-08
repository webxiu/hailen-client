declare module "*.css";
declare module "*.png";
declare module "*.ico";
declare module "*.js";
declare module "*.json";
declare module "*.node";
declare module "*.mp4";

/** 返回地址 */
declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.less" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react" {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

import Koa from "koa";
declare module "koa" {
  interface Request {
    body?: unknown | any;
    rawBody: string;
  }
}

export {};

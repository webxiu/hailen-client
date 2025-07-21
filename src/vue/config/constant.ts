import { type PaginationProps } from "element-plus";

/** 不验证Token的白名单 */
export const whiteList = ["/user/login", "/user/register"];

/** 颜色选择器默认颜色 */
// prettier-ignore
export const predefineColors = ["#ffffff", "#303133", "#2200aa", "#0000FF", "#1e90ff", "#409eff", "#73A3F5", "#f590e4", "#c71585", "#dc143c", "#F53145", "#FF0000", "#ff6600", "#ff8c00", "#e6a23c", "#ffc107", "#F5F31B", "#bbff00", "#00FF00", "#90ee90", "#00dd00", "#67c23a", "#008800", "#227700", "#009688", "#909399", "#00ced1", "#ccddff", "#ffcccc", "#F59DC3", "#f56c6c", "#d2691e", "#F59773", "#F5D273", "#770077", "#8c0044", "hsv(51, 100, 98)", "rgba(255, 69, 0, 0.68)", "hsva(120, 40, 94, 0.5)", "hsla(209, 100%, 56%, 0.73)"];

/** 分页配置(必须解构使用, 避免引用同一地址) */
export const PAGE_CONFIG: PaginationProps = {
  /** 总条数 */
  total: 0,
  /** 每页条数(与 pageSizes 第一项必须相同) */
  pageSize: 30,
  /** 分页尺寸 */
  small: false,
  /** 背景 */
  background: true,
  /** 当前页 */
  currentPage: 1,
  /** 分页选择 */
  pageSizes: [30, 100, 500, 1000, 100000]
} as PaginationProps;

// 微信浏览器标识
export const weixinUserAgent ="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 MicroMessenger/2.9.0.1080(0x6209004A) Process/MMDownloadProcess WindowsWechat";

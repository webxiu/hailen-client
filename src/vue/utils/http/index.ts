/*
 * @Author: Hailen
 * @Date: 2023-07-13 10:10:59
 * @Last Modified by: Hailen
 * @Last Modified time: 2025-03-08 14:36:08
 */

import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken, CustomParamsSerializer } from "axios";
import { PureHttpError, PureHttpRequestConfig, PureHttpResponse, RequestMethods } from "./types.d";

import type { Canceler } from "axios";
import NProgress from "../progress";
import { getUserInfo } from "@/vue/utils/storage";
import { message } from "@/vue/utils/message";
import { stringify } from "qs";
import { useUserStoreHook } from "@/vue/store/modules/user";
import { whiteList } from "@/vue/router/index";

const userStore = useUserStoreHook();

const defaultConfig: AxiosRequestConfig = {
  baseURL: process.env.VITE_BASE_API,
  timeout: 60 * 1000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

/** 状态码说明 */
const STATUS_CODE: Record<number, string> = {
  400: "请求失败",
  // 401: "登录过期",
  403: "无访问权限",
  404: "页面未找到",
  405: "请求方法未找到",
  408: "请求超时",
  500: "服务内部错误"
};
class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 移除字符串前后空格 */
  private removeBlank(data: Record<string, any>) {
    if (typeof data === "object") {
      for (const key in data) {
        if (typeof data[key] === "string") {
          data[key] = data[key].trim();
        }
      }
    }
    return data;
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        this.removeBlank(config.data); // 移除请求参数前后空格
        const userInfo = getUserInfo();
        if (config.headers && userInfo.token) {
          config.headers["Authorization"] = "Bearer " + userInfo.token;
        }

        // 是否隐藏Loading
        if (!config.hideLoading) {
          NProgress.start();
          // useAppStoreHook().pushPageLoading("loading");
        }
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        const hasAuth = whiteList.some((v) => config.url && config.url.indexOf(v) > -1);
        return hasAuth ? config : new Promise((resolve) => resolve(config));
      },
      (error) => Promise.reject(error)
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        NProgress.done();
        const $config = response.config;
        const data = response.data;
        // 关闭loading
        // useAppStoreHook().popPageLoading();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
        }

        // ================ 状态码判断 start ================
        if (data.status === 200) {
          data.message && message.success(data.message);
          return data;
        } else if (response.status === 200 && !data.status) {
          return data; // 处理Excel数据导出没有包装响应格式
        }

        if (data.status === 401) {
          message.error(data.message);
          const timer = setTimeout(() => {
            userStore.logOut();
            clearTimeout(timer);
          }, 1500);
        } else if (STATUS_CODE[data.status]) {
          message.error(data.message);
        } else {
          message.error(data.message || "服务器错误, 错误代码:" + data.status);
        }
        return Promise.reject(data);
        // ================ 状态码判断 end ================
      },
      (error: PureHttpError) => {
        console.log("http_error:", error);
        // 关闭loading
        // useAppStoreHook().popPageLoading();
        const data = error.response?.data as any;
        const status = error.response?.status as any;

        if (!data) {
          message.error(error.message);
        } else if (STATUS_CODE[data.status]) {
          message.error(data.error || error.message);
        }

        if (error?.isCancelRequest) {
          error.isCancelRequest = Axios.isCancel(error);
        }
        // 关闭进度条动画
        NProgress.done();
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject(error);
      }
    );
  }

  /**
   * 通用请求工具函数
   * method: 第一个参数是对象则为options方式配置请求参数, 调用接口是可自定义拦截请求和响应, 可配置取消请求 {..., cancelToken: InjectAbort(login) }
   */
  public request<T>(method: RequestMethods | PureHttpRequestConfig, url?: string, param?: AxiosRequestConfig, config?: PureHttpRequestConfig): Promise<BaseResponseType<T>> {
    let option = { method, url, ...param, ...config } as PureHttpRequestConfig;
    if (typeof method === "object") option = method; // 判断是否为options方式

    // 单独处理自定义请求/响应回调
    return new Promise<BaseResponseType<T>>((resolve, reject) => {
      PureHttp.axiosInstance
        .request(option)
        .then((response: any) => resolve(response as BaseResponseType<T>))
        .catch((error) => reject(error));
    });
  }

  /** 单独抽离的post工具函数 */
  public post<T, P>(url: string, params?: AxiosRequestConfig<T>, config?: PureHttpRequestConfig): Promise<BaseResponseType<P>> {
    return this.request<P>("post", url, params, config);
  }

  /** 单独抽离的get工具函数 */
  public get<T, P>(url: string, params?: AxiosRequestConfig<T>, config?: PureHttpRequestConfig): Promise<BaseResponseType<P>> {
    return this.request<P>("get", url, params, config);
  }
}

/** 为请求方法注入取消请求 */
export function InjectCancel(fn: Function & { cancel: Canceler }) {
  const cancelToken = Axios.CancelToken;
  const source = cancelToken.source();
  fn["cancel"] = source.cancel;
  return source.token;
}

export const http = new PureHttp();

import Axios, { AxiosInstance, Method, AxiosError, AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export type resultType = {
  accessToken?: string;
};

export type RequestMethods = Extract<Method, "get" | "post" | "put" | "delete" | "patch" | "option" | "head">;

export interface PureHttpError extends AxiosError {
  isCancelRequest?: boolean;
}

export interface PureHttpResponse extends AxiosResponse {
  config: PureHttpRequestConfig;
}

export interface PureHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: PureHttpRequestConfig) => void;
  beforeResponseCallback?: (response: PureHttpResponse) => void;
  hideLoading?: boolean;
}

export default class PureHttp {
  request<T>(method: RequestMethods, url: string, param?: AxiosRequestConfig, config?: PureHttpRequestConfig): Promise<T>;
  request<T>(option: PureHttpRequestConfig): Promise<T>;
  post<T, P>(url: string, params?: T, config?: PureHttpRequestConfig): Promise<P>;
  get<T, P>(url: string, params?: T, config?: PureHttpRequestConfig): Promise<P>;
}

// 扩展 AxiosRequestConfig 接口
export interface HxRequestConfig<T = any> extends AxiosRequestConfig {
  beforeRequestFn?: (config: HxRequestConfig<T>) => void | Promise<void>;
}

// 创建自定义的 Axios 实例类型
export interface HxAxiosInstance extends AxiosInstance {
  <T = any>(config: HxRequestConfig<T>): Promise<AxiosResponse<BaseServeResponse<T>>>;
  get<T = any>(url: string, config?: HxRequestConfig<T>): Promise<AxiosResponse<BaseServeResponse<T>>>;
  post<T = any>(url: string, data?: any, config?: HxRequestConfig<T>): Promise<AxiosResponse<BaseServeResponse<T>>>;
  put<T = any>(url: string, data?: any, config?: HxRequestConfig<T>): Promise<AxiosResponse<BaseServeResponse<T>>>;
  delete<T = any>(url: string, config?: HxRequestConfig<T>): Promise<AxiosResponse<BaseServeResponse<T>>>;
}

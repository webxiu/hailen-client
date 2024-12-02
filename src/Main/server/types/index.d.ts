/**
 * 接口请求数据响应类型
 */
export interface BaseResponseType<T> {
  data: T;
  status: number;
  message: string;
}

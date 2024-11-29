import { Context, Next } from "koa";

import dayjs from "dayjs";

const logger = async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const time = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
  const { method, protocol, host, url, response } = ctx;
  const formUrl = `${protocol}://${host}${decodeURIComponent(url)}`;
  console.log(`${method} ${formUrl} ${response.status} - ${ms}ms ${time}`);
};

export default logger;

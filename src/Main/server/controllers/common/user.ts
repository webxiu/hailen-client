import { Context } from "koa";
import { User } from "~/types/user";

// 假设这里有一个简单的用户数据
const users: User[] = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
];

export const getUsers = async (ctx: Context) => {
  ctx.body = users;
};

export const getUserById = async (ctx: Context) => {
  const id = parseInt(ctx.params.id);
  const user = users.find((u) => u.id === id);
  if (user) {
    ctx.body = user;
  } else {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
  }
};

export const createUser = async (ctx: Context) => {
  const newUser: User = ctx.request.body as User;
  newUser.id = users.length + 1;
  users.push(newUser);
  ctx.status = 201;
  ctx.body = newUser;
};

export interface UserItemType {
  id: number;
  username: string;
  password: string;
  email: string;
  phone: string;
}

export interface User {
  user: UserItemType;
  token: string;
}

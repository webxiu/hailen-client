export interface User {
  user: {
    id?: number;
    username: string;
    password: string;
    email: string;
    phone: string;
  };
  token: string;
}

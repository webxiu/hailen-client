// "start:dev": "concurrently \"yarn dev\" \"yarn watch\" \"wait-on tcp:8081 && cross-env NODE_ENV=development electron ./dist/main.js\""
// payload.js

const initialUserPayload = {
  username: "",
  email: "",
  roles: [],
};

export function createUserPayload(
  username: string,
  email: string,
  roles: string[]
) {
  return {
    ...initialUserPayload,
    username,
    email,
    roles,
  };
}

export const userPayloadExample = createUserPayload(
  "John Doe",
  "john.doe@example.com",
  ["admin", "user"]
);

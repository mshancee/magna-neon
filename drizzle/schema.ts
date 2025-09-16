export * from "./schema/enums"; // export this first

export * from "./schema/users";
//add other tables here as you create them

import { users } from "./schema/users";
// add other tables here as you create them

// schema object for Drizzle CLI and queryClient usage
export const schema = {
  users,
  // add other tables here as you create them
};

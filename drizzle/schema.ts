export * from "./schema/enums"; // export this first

export * from "./schema/users";
export * from "./schema/accounts";
export * from "./schema/sessions";
//add other tables here as you create them

import { users } from "./schema/users";
import { accounts } from "./schema/accounts";
import { sessions } from "./schema/sessions";
// add other tables here as you create them

// schema object for Drizzle CLI and queryClient usage
export const schema = {
  users,
  accounts,
  sessions,
  // add other tables here as you create them
};

import { createUser } from "./auth.repository"

type UserInput = {
  clerkId: string;
  email: string;
  name: string;
}

export const syncClerkUser = async (userInput: UserInput) => {
  return await createUser({
    clerkId: userInput.clerkId,
    name: userInput.name,
    email: userInput.email
  })
}

import {createUser} from "./auth.repository"

type userInput = {
    clerkId: string;
    email: string;
    name: string;
}

export const syncClerkUser =async (userInput: userInput) => {
    try {
        return await createUser({
            clerkId: userInput.clerkId,
            name:  userInput.name,
            email: userInput.email
        })
    } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("User already exists");
        }
        throw error;
    }
}
import { createUser } from "./auth.repository"
import { AppError } from "@/middleware/errorHandler"
import { Prisma } from "@prisma/client"

type UserInput = {
  clerkId: string;
  email: string;
  name: string;
}

export const syncClerkUser = async (userInput: UserInput) => {
  try {
    return await createUser({
      clerkId: userInput.clerkId,
      name: userInput.name,
      email: userInput.email
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("User already exists", 409)
    }

    throw error
  }
}
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isValidCurrency } from "@/lib/currency";

export async function updateUserCurrency(currencyCode) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Validate currency code
    if (!isValidCurrency(currencyCode)) {
      throw new Error("Invalid currency code");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Update user's currency preference
    await db.user.update({
      where: { id: user.id },
      data: { currency: currencyCode },
    });

    revalidatePath("/dashboard");
    revalidatePath("/account");
    revalidatePath("/transaction");
    
    return { success: true, currency: currencyCode };
  } catch (error) {
    console.error("Error updating user currency:", error);
    throw new Error(error.message);
  }
}

export async function getUserCurrency() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return "INR"; // Default currency for unauthenticated users
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { currency: true },
    });

    return user?.currency || "INR";
  } catch (error) {
    console.error("Error getting user currency:", error);
    return "INR"; // Default currency on error
  }
}

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export default async function TransactionRedirectPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/dashboard");
  }

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    redirect("/dashboard");
  }

  // Prefer default account; otherwise fall back to the most recently created account
  const defaultAccount = await db.account.findFirst({
    where: { userId: user.id, isDefault: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const targetAccount =
    defaultAccount ||
    (await db.account.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    }));

  if (targetAccount?.id) {
    redirect(`/account/${targetAccount.id}`);
  }

  // If user has no accounts, send them to accounts page to create one
  redirect("/account");
}



















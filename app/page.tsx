import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  return redirect("/dashboard");
} 
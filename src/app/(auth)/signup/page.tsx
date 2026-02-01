import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SignupForm from "./SignupForm";

const Signup = async () => {
  const session = await auth();

  // Not logged in - redirect to login
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user is super admin
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  // Not a super admin - redirect to dashboard
  if (!user?.isSuperAdmin) {
    redirect("/dashboard/inward");
  }

  return <SignupForm />;
};

export default Signup;
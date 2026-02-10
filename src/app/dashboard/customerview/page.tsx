import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CustomerViewPage from "@/components/customerview/CustomerViewPage";

const Page = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect("/dashboard");
  }

  return <CustomerViewPage />;
};

export default Page;
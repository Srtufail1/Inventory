import AppBar from "@/components/AppBar";
// import AuthDesign from "@/components/AuthDesign";
import { auth } from "../../auth";
import { db } from "@/lib/db";
import ClientComp from "@/components/ClientComp";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) {
    const user = await db.user.findUnique({
      where: { email: session?.user?.email! },
      include: { Inventory: true },
    });

    if (user && !user?.isAdmin) {
      return (
        <>
          <AppBar />
          <ClientComp user={user} />
        </>
      );
    } else if (user && user?.isAdmin) {
      redirect("/dashboard/inward");
    }
  } else {
    redirect("/login");
    // return (
    //   <>
    //     <AppBar />
    //     <AuthDesign />
    //   </>
    // );
  }
}

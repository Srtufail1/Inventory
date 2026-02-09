import AppBar from "@/components/AppBar";
import { auth } from "../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/clientdashboard/ClientDashboard";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session?.user?.email! },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.isAdmin) {
    redirect("/dashboard/inward");
  }

  // Fetch inward/outward records matching user's name as customer
  const customerName = user.name;

  const [inwardData, outwardData] = await Promise.all([
    db.inward.findMany({
      where: {
        customer: {
          equals: customerName,
          mode: "insensitive",
        },
      },
      orderBy: { addDate: "desc" },
    }),
    db.outward.findMany({
      where: {
        customer: {
          equals: customerName,
          mode: "insensitive",
        },
      },
      orderBy: { outDate: "desc" },
    }),
  ]);

  const serializedInward = inwardData.map((item) => ({
    id: item.id,
    inumber: item.inumber,
    addDate: item.addDate.toISOString(),
    customer: item.customer,
    item: item.item,
    packing: item.packing,
    weight: item.weight,
    quantity: item.quantity,
    store_rate: item.store_rate,
    labour_rate: item.labour_rate,
  }));

  const serializedOutward = outwardData.map((item) => ({
    id: item.id,
    onumber: item.onumber,
    inumber: item.inumber,
    outDate: item.outDate.toISOString(),
    customer: item.customer,
    item: item.item,
    quantity: item.quantity,
  }));

  return (
    <>
      <AppBar />
      <ClientDashboard
        userName={user.name}
        inwardData={serializedInward}
        outwardData={serializedOutward}
      />
    </>
  );
}
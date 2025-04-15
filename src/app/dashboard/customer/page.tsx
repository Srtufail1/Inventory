import { db } from "@/lib/db";
import CustomerPage from "@/components/customer/CustomerPage";

export default async function CustomersPage() {
  const inwardData = await db.inward.findMany({
    select: {
      customer: true,
    },
    distinct: ['customer'],
  });

  const customerData = inwardData.map(item => ({
    customer: item.customer,
    totalInwards: 0, // You'll need to calculate this
  }));

  // Calculate totalInwards for each customer
  for (let customer of customerData) {
    const count = await db.inward.count({
      where: {
        customer: customer.customer,
      },
    });
    customer.totalInwards = count;
  }

  return <CustomerPage data={customerData} />;
}
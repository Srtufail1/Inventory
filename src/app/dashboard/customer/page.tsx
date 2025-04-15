import { db } from "@/lib/db";
import CustomerPage from "@/components/customer/CustomerPage";

export default async function CustomersPage() {
  const customerData = await db.inward.groupBy({
    by: ['customer'],
    _count: {
      customer: true
    },
    orderBy: {
      customer: 'asc'
    }
  });

  const formattedData = customerData.map(item => ({
    customer: item.customer,
    totalInwards: item._count.customer,
  }));

  return <CustomerPage data={formattedData} />;
}
import React from "react";
import LedgerPage from "@/components/ledger/LedgerPage";
import { db } from "@/lib/db"; // Assuming you have a db configuration file

const Ledger = async () => {
  const [outwardData, inwardData, clients] = await Promise.all([
    db.outward.findMany(),
    db.inward.findMany(),
    db.user.findMany(),
  ]);

  const combinedData = [
    ...outwardData.map(item => ({ ...item, type: 'outward' })),
    ...inwardData.map(item => ({ ...item, type: 'inward' })),
  ];

  return <LedgerPage />;
};

export default Ledger;
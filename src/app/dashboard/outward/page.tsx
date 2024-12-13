import React from "react";
import OutwardTable from "@/components/outward/OutwardTable";
import { db } from "@/lib/db";

const outward = async () => {
  const [outwardData, clients] = await db.$transaction([
    db.outward.findMany(),
    db.user.findMany(),
  ]);

  const response = outwardData?.map((inv) => {
    return { ...inv, clients };
  });
  return <OutwardTable data={response} />
};

export default outward;
import React from "react";
import InwardTable from "@/components/inward/InwardTable";
import { db } from "@/lib/db";

const inward = async () => {
  const [inwardData, clients] = await db.$transaction([
    db.inward.findMany(),
    db.user.findMany(),
  ]);

  const response = inwardData?.map((inv) => {
    return { ...inv, clients };
  });
  return <InwardTable data={response} />
};

export default inward;
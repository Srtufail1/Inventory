import React from "react";
import InwardData from "./InwardData";
import { InwardDelete } from "./InwardDelete";

const InwardUpdate = ({ row }: any) => {
  const data = row.original;
  return (
    <div className="flex gap-5">
      <InwardData title="Update" data={data} />
      <InwardDelete data={data} />
    </div>
  );
};

export default InwardUpdate;

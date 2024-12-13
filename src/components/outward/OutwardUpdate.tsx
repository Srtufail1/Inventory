import React from "react";
import OutwardData from "./OutwardData";
import { OutwardDelete } from "./OutwardDelete";

const OutwardUpdate = ({ row }: any) => {
  const data = row.original;
  return (
    <div className="flex gap-5">
      <OutwardData title="Update" data={data} />
      <OutwardDelete data={data} />
    </div>
  );
};

export default OutwardUpdate;

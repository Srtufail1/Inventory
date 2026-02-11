import React from "react";
import NoteData from "./NoteData";
import { NoteDelete } from "./NoteDelete";

const NoteUpdate = ({ row }: any) => {
  const data = row.original;
  return (
    <div className="flex gap-5">
      <NoteData title="Update" data={data} />
      <NoteDelete data={data} />
    </div>
  );
};

export default NoteUpdate;
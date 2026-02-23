"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateOutwardNotes = async (id: string, notes: string) => {
  if (!id) {
    return { error: "Outward ID is required" };
  }

  try {
    const outward = await db.outward.findUnique({ where: { id } });
    if (!outward) {
      return { error: "Outward record not found" };
    }

    const updated = await db.outward.update({
      where: { id },
      data: {
        notes: notes.trim() || null,
      },
    });

    if (!updated) {
      return { error: "Failed to update notes" };
    }

    revalidatePath("/dashboard/outward");
    return { success: true, notes: updated.notes };
  } catch (error) {
    console.error("Update outward notes error:", error);
    return { error: "Failed to update notes" };
  }
};

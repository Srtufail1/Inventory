"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateInwardNotes = async (id: string, notes: string) => {
  if (!id) {
    return { error: "Inward ID is required" };
  }

  try {
    const inward = await db.inward.findUnique({ where: { id } });
    if (!inward) {
      return { error: "Inward record not found" };
    }

    const updated = await db.inward.update({
      where: { id },
      data: {
        notes: notes.trim() || null,
      },
    });

    if (!updated) {
      return { error: "Failed to update notes" };
    }

    revalidatePath("/dashboard/inward");
    return { success: true, notes: updated.notes };
  } catch (error) {
    console.error("Update inward notes error:", error);
    return { error: "Failed to update notes" };
  }
};
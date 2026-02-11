"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Add or update a note
export const addUpdateNote = async (formData: FormData, data: any) => {
  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const customer = (formData.get("customer") as string) || null;
  const inumber = (formData.get("inumber") as string) || null;
  const item = (formData.get("item") as string) || null;
  const quantity = (formData.get("quantity") as string) || null;
  const dateString = formData.get("date") as string;
  const date = dateString ? new Date(dateString) : null;

  if (!type || !title || !description) {
    return { error: "Type, title, and description are required" };
  }

  let note;
  try {
    if (data?.id) {
      note = await db.note.update({
        where: { id: data.id },
        data: {
          type,
          title,
          description,
          customer,
          inumber,
          item,
          quantity,
          date,
        },
      });
    } else {
      note = await db.note.create({
        data: {
          type,
          title,
          description,
          customer,
          inumber,
          item,
          quantity,
          date,
        },
      });
    }
    if (!note) {
      return { error: "Failed to save note" };
    }
  } catch (error) {
    console.error("Note save error:", error);
    return { error: "Failed to save note" };
  }

  revalidatePath("/dashboard/notes");
  return note;
};

// Delete a note
export const deleteNote = async (id: string) => {
  try {
    const result = await db.note.delete({
      where: { id },
    });
    revalidatePath("/dashboard/notes");
    if (!result) {
      return { error: "Note not deleted" };
    }
  } catch (error) {
    console.error("Note delete error:", error);
    return { error: "Note not deleted" };
  }
};
"use server";

import { db } from "@/lib/db";
import { auth, signIn } from "../../auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const loginSignup = async (formData: FormData, isLogin: boolean) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const deviceToken = formData.get("deviceToken") as string;

  const user = await db.user.findUnique({
    where: { email },
    select: { isAdmin: true, loginToken: true },
  });

  // Check device token before attempting login
  if (user && user.loginToken && user.loginToken !== "false") {
    if (user.loginToken !== deviceToken) {
      return { error: "Access denied." };
    }
  }

  const res = await signIn("credentials", {
    name,
    email,
    password,
    isLogin,
    redirect: true,
    callbackUrl: "/",
  })
    .then(() => {
      redirect("/");
    })
    .catch((err) => {
      if (err?.toString() == "Error: NEXT_REDIRECT") {
        user?.isAdmin ? redirect("/dashboard/inward") : redirect("/");
      } else return { error: err?.type };
    });

  if (!isLogin && res?.error) {
    return { error: "credentials already exists" };
  } else {
    return { error: "wrong credentials" };
  }
};

// update user role
export const updateUserRole = async (
  formData: FormData,
  updatedData: {
    name: string;
    email: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    loginToken: string;
  },
  data: any
) => {
  const { name, email, isAdmin, isSuperAdmin, loginToken } = updatedData;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  const checkUser = await db.user.findUnique({ where: { id: data?.id } });
  if (!checkUser) return { error: "User not found" };

  let user;
  try {
    user = await db.user.update({
      where: { id: data?.id },
      data: {
        name,
        email,
        isAdmin,
        isSuperAdmin,
        loginToken,
      },
    });
    if (!user) {
      return { error: "User not updated" };
    }
  } catch (error) {
    console.error("Update error:", error);
    return { error: "User not updated" };
  }

  revalidatePath(`/dashboard/clients`);
  return user;
};

// add/update inward

export const addUpdateInward = async (formData: FormData, data: any) => {
  const inumber = formData.get("inumber") as string;
  const addDateString = formData.get("addDate") as string;
  const addDate = new Date(addDateString);
  const customer = formData.get("customer") as string;
  const item = formData.get("item") as string;
  const packing = formData.get("packing") as string;
  const weight = formData.get("weight") as string;
  const quantity = formData.get("quantity") as string;
  const store_rate = formData.get("store_rate") as string;
  const labour_rate = formData.get("labour_rate") as string;

  if (!inumber || !customer || !addDate || !item || !packing || !weight || !quantity || !store_rate || !labour_rate) {
    return { error: "All fields are required" };
  }

  const session = await auth();
  const userEmail = session?.user?.email || "unknown";
  const userName = session?.user?.name || "unknown";

  let inward;
  try {
    if (data?.id) {
      const oldRecord = await db.inward.findUnique({ where: { id: data.id } });
      inward = await db.inward.update({
        where: { id: data?.id },
        data: {
          inumber,
          addDate,
          customer,
          item,
          packing,
          weight,
          quantity,
          store_rate,
          labour_rate,
        },
      });
      // Audit log for update
      const changes: Record<string, { old: any; new: any }> = {};
      if (oldRecord) {
        if (oldRecord.inumber !== inumber) changes.inumber = { old: oldRecord.inumber, new: inumber };
        if (oldRecord.customer !== customer) changes.customer = { old: oldRecord.customer, new: customer };
        if (oldRecord.item !== item) changes.item = { old: oldRecord.item, new: item };
        if (oldRecord.packing !== packing) changes.packing = { old: oldRecord.packing, new: packing };
        if (oldRecord.weight !== weight) changes.weight = { old: oldRecord.weight, new: weight };
        if (oldRecord.quantity !== quantity) changes.quantity = { old: oldRecord.quantity, new: quantity };
        if (oldRecord.store_rate !== store_rate) changes.store_rate = { old: oldRecord.store_rate, new: store_rate };
        if (oldRecord.labour_rate !== labour_rate) changes.labour_rate = { old: oldRecord.labour_rate, new: labour_rate };
        if (oldRecord.addDate.toISOString() !== addDate.toISOString()) changes.addDate = { old: oldRecord.addDate.toISOString(), new: addDate.toISOString() };
      }
      await db.auditLog.create({
        data: {
          action: "update",
          entity: "inward",
          entityId: data.id,
          user: userEmail,
          userName,
          customer,
          inumber,
          item,
          quantity,
          changes: JSON.stringify(changes),
        },
      });
    } else {
      inward = await db.inward.create({
        data: {
          inumber,
          addDate,
          customer,
          item,
          packing,
          weight,
          quantity,
          store_rate,
          labour_rate,
        },
      });
      // Audit log for create
      await db.auditLog.create({
        data: {
          action: "create",
          entity: "inward",
          entityId: inward.id,
          user: userEmail,
          userName,
          customer,
          inumber,
          item,
          quantity,
        },
      });
    }
    if (!inward) {
      return { error: "failed to create inward data" };
    }
  } catch (error) {
    return { error: "failed to create inward data" };
  }

  revalidatePath(`/dashboard/inward`);
  revalidatePath(`/dashboard/logs`);
  return inward;
};

// delete inward

export const DeleteInward = async (id: string) => {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "unknown";
    const userName = session?.user?.name || "unknown";

    const record = await db.inward.findUnique({ where: { id } });
    const result = await db.inward.delete({
      where: { id },
    });

    // Audit log for delete
    if (record) {
      await db.auditLog.create({
        data: {
          action: "delete",
          entity: "inward",
          entityId: id,
          user: userEmail,
          userName,
          customer: record.customer,
          inumber: record.inumber,
          item: record.item,
          quantity: record.quantity,
        },
      });
    }

    revalidatePath("/dashboard/inward");
    revalidatePath("/dashboard/logs");
    if (!result) {
      return { error: "inward not deleted" };
    }
  } catch (error) {
    return { error: "inward not deleted" };
  }
};

// add/update outward

export const addUpdateOutward = async (formData: FormData, data: any) => {
  const onumber = formData.get("onumber") as string;
  const inumber = formData.get("inumber") as string;
  const outDateString = formData.get("outDate") as string;
  const outDate = new Date(outDateString);
  const customer = formData.get("customer") as string;
  const item = formData.get("item") as string;
  const quantity = formData.get("quantity") as string;

  if (!onumber || !customer || !outDate || !item || !quantity || !inumber) {
    return { error: "All fields are required" };
  }

  const session = await auth();
  const userEmail = session?.user?.email || "unknown";
  const userName = session?.user?.name || "unknown";

  let outward;
  try {
    if (data?.id) {
      const oldRecord = await db.outward.findUnique({ where: { id: data.id } });
      outward = await db.outward.update({
        where: { id: data?.id },
        data: {
          onumber,
          inumber,
          outDate,
          customer,
          item,
          quantity,
        },
      });
      // Audit log for update
      const changes: Record<string, { old: any; new: any }> = {};
      if (oldRecord) {
        if (oldRecord.onumber !== onumber) changes.onumber = { old: oldRecord.onumber, new: onumber };
        if (oldRecord.inumber !== inumber) changes.inumber = { old: oldRecord.inumber, new: inumber };
        if (oldRecord.customer !== customer) changes.customer = { old: oldRecord.customer, new: customer };
        if (oldRecord.item !== item) changes.item = { old: oldRecord.item, new: item };
        if (oldRecord.quantity !== quantity) changes.quantity = { old: oldRecord.quantity, new: quantity };
        if (oldRecord.outDate.toISOString() !== outDate.toISOString()) changes.outDate = { old: oldRecord.outDate.toISOString(), new: outDate.toISOString() };
      }
      await db.auditLog.create({
        data: {
          action: "update",
          entity: "outward",
          entityId: data.id,
          user: userEmail,
          userName,
          customer,
          inumber,
          item,
          quantity,
          changes: JSON.stringify(changes),
        },
      });
    } else {
      outward = await db.outward.create({
        data: {
          onumber,
          inumber,
          outDate,
          customer,
          item,
          quantity,
        },
      });
      // Audit log for create
      await db.auditLog.create({
        data: {
          action: "create",
          entity: "outward",
          entityId: outward.id,
          user: userEmail,
          userName,
          customer,
          inumber,
          item,
          quantity,
        },
      });
    }
    if (!outward) {
      return { error: "failed to create outward data" };
    }
  } catch (error) {
    return { error: "failed to create outward data" };
  }

  revalidatePath(`/dashboard/outward`);
  revalidatePath(`/dashboard/logs`);
  return outward;
};

// delete outward

export const DeleteOutward = async (id: string) => {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "unknown";
    const userName = session?.user?.name || "unknown";

    const record = await db.outward.findUnique({ where: { id } });
    const result = await db.outward.delete({
      where: { id },
    });

    // Audit log for delete
    if (record) {
      await db.auditLog.create({
        data: {
          action: "delete",
          entity: "outward",
          entityId: id,
          user: userEmail,
          userName,
          customer: record.customer,
          inumber: record.inumber,
          item: record.item,
          quantity: record.quantity,
        },
      });
    }

    revalidatePath("/dashboard/outward");
    revalidatePath("/dashboard/logs");
    if (!result) {
      return { error: "outward not deleted" };
    }
  } catch (error) {
    return { error: "outward not deleted" };
  }
};
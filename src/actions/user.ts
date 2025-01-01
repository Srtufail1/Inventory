"use server";

import { db } from "@/lib/db";
import { auth, signIn } from "../../auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const loginSignup = async (formData: FormData, isLogin: boolean) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.user.findUnique({
    where: { email },
    select: { isAdmin: true },
  });

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

// update user
export const updateUser = async (
  id: string,
  userId: string,
  isAdmin: boolean
) => {
  let inventory;
  try {
    inventory = await db.inventory.update({
      where: { id },
      data: { userId },
    });

    if (!inventory) {
      return { error: "failed to transfer" };
    }
  } catch (error) {
    return { error: "failed to transfer" };
  }

  revalidatePath(`${isAdmin ? "/dashboard" : "/"}`);
  return inventory;
};

// update user role
export const updateUserRole = async (
  formData: FormData,
  isAdmin: boolean,
  data: any
) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }
  const checkEmail = await db.user.findUnique({ where: { email } });
  if (!checkEmail) return { error: "User not found" };

  let user;
  try {
    user = await db.user.update({
      where: { id: data?.id },
      data: { name, email, password, isAdmin },
    });
    console.log(user, "user");
    if (!user) {
      return { error: "User not udpated" };
    }
  } catch (error) {
    return { error: "User not udpated" };
  }

  revalidatePath(`/dashboard/clients`);
  return user;
};

// add/update inventory

export const addUpdateInventory = async (formData: FormData, data: any) => {
  const session = await auth();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const getCost = formData.get("cost") as string;
  const cost = Number(getCost);

  const user = await db.user.findUnique({
    where: { email: session?.user?.email! },
  });

  if (!name || !description || !cost) {
    return { error: "All fields are required" };
  }

  let inventory;
  try {
    if (data?.id) {
      inventory = await db.inventory.update({
        where: { id: data?.id },
        data: { name, description, cost, userId: user?.id },
      });
    } else {
      inventory = await db.inventory.create({
        data: { name, description, cost, userId: user?.id },
      });
    }
    if (!inventory) {
      return { error: "failed to create inventory" };
    }
  } catch (error) {
    return { error: "failed to create inventory" };
  }

  revalidatePath(`/dashboard`);
  return inventory;
};

// delete inventory

export const DeleteInventory = async (id: string) => {
  try {
    const result = await db.inventory.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    if (!result) {
      return { error: "inventory not deleted" };
    }
  } catch (error) {
    return { error: "inventory not deleted" };
  }
};

// add/update inward

export const addUpdateInward = async (formData: FormData, data: any) => {
  const session = await auth();

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

  const user = await db.user.findUnique({
    where: { email: session?.user?.email! },
  });

  if ( !inumber || !customer || !addDate || !customer || !item || !packing || !weight || !quantity || !store_rate || !labour_rate ) {
    return { error: "All fields are required" };
  }

  let inward;
  try {
    if (data?.id) {
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
    }
    if (!inward) {
      return { error: "failed to create inward data" };
    }
  } catch (error) {
    return { error: "failed to create inward data" };
  }

  revalidatePath(`/dashboard/inward`);
  return inward;
};

// delete inward

export const DeleteInward = async (id: string) => {
  try {
    const result = await db.inward.delete({
      where: { id },
    });
    revalidatePath("/dashboard/inward");
    if (!result) {
      return { error: "inward not deleted" };
    }
  } catch (error) {
    return { error: "inward not deleted" };
  }
};



// add/update outward

export const addUpdateOutward = async (formData: FormData, data: any) => {
  const session = await auth();

  const onumber = formData.get("onumber") as string;
  const inumber = formData.get("inumber") as string;
  const outDateString = formData.get("outDate") as string;
  const outDate = new Date(outDateString);
  const customer = formData.get("customer") as string;
  const item = formData.get("item") as string;
  const quantity = formData.get("quantity") as string;

  const user = await db.user.findUnique({
    where: { email: session?.user?.email! },
  });

  if (!onumber || !customer || !outDate || !item || !quantity || !inumber) {
    return { error: "All fields are required" };
  }

  let outward;
  try {
    if (data?.id) {
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
    }
    if (!outward) {
      return { error: "failed to create outward data" };
    }
  } catch (error) {
    return { error: "failed to create outward data" };
  }

  revalidatePath(`/dashboard/outward`);
  return outward;
};

// delete outward

export const DeleteOutward = async (id: string) => {
  try {
    const result = await db.outward.delete({
      where: { id },
    });
    revalidatePath("/dashboard/outward");
    if (!result) {
      return { error: "outward not deleted" };
    }
  } catch (error) {
    return { error: "outward not deleted" };
  }
};

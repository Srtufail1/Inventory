import { auth } from "../../auth";
import { db } from "@/lib/db";

/**
 * Checks if the current user has super admin privileges.
 * @returns {Promise<boolean>} True if the user is a super admin, false otherwise.
 */
export async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return false;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  return !!user?.isSuperAdmin;
}

/**
 * Checks if the current user has admin privileges.
 * @returns {Promise<boolean>} True if the user is an admin, false otherwise.
 */
export async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return false;
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  return !!user?.isAdmin;
}

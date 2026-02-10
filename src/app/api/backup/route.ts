import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { auth } from "../../../../auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verify session and super admin status
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { isSuperAdmin: true },
    });

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all collections
    const [users, inwardData, outwardData] = await Promise.all([
      db.user.findMany(),
      db.inward.findMany(),
      db.outward.findMany(),
    ]);

    // Remove passwords from user data for security
    const sanitizedUsers = users.map(({ password, ...rest }) => rest);

    const backup = {
      exportDate: new Date().toISOString(),
      collections: {
        users: sanitizedUsers,
        inward: inwardData,
        outward: outwardData,
      },
      counts: {
        users: sanitizedUsers.length,
        inward: inwardData.length,
        outward: outwardData.length,
      },
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="zamzam-backup-${dateStr}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
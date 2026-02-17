import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { auth } from "../../../../auth";

export const dynamic = 'force-dynamic';

type ExtendedNumberLong = { $numberLong: string };
type CursorId = ExtendedNumberLong | number | bigint | string;

type MongoCommandResult = {
  cursor?: {
    id?: CursorId;
    firstBatch?: unknown[];
    nextBatch?: unknown[];
  };
};

const hasMoreCursorData = (cursorId: CursorId | undefined | null): boolean => {
  if (cursorId === undefined || cursorId === null) return false;
  if (typeof cursorId === "object" && "$numberLong" in cursorId)
    return cursorId.$numberLong !== "0";
  if (typeof cursorId === "bigint") return cursorId !== BigInt(0);
  if (typeof cursorId === "number") return cursorId !== 0;
  return cursorId !== "0";
};

const getMoreCursorValue = (cursorId: CursorId) => {
  if (typeof cursorId === "object" && "$numberLong" in cursorId)
    return cursorId; // pass back as-is in Extended JSON format
  if (typeof cursorId === "bigint")
    return { $numberLong: cursorId.toString() };
  return cursorId;
};

const getCollectionDocuments = async (collectionName: string) => {
  const initialResult = (await db.$runCommandRaw({
    find: collectionName,
    filter: {},
    batchSize: 50000,
  })) as MongoCommandResult;

  const documents: unknown[] = [...(initialResult.cursor?.firstBatch ?? [])];
  let cursorId = initialResult.cursor?.id;

  while (hasMoreCursorData(cursorId)) {
    if (cursorId === undefined || cursorId === null) break;

    const nextResult = (await db.$runCommandRaw({
      getMore: getMoreCursorValue(cursorId),
      collection: collectionName,
      batchSize: 50000,
    })) as MongoCommandResult;

    documents.push(...(nextResult.cursor?.nextBatch ?? []));
    cursorId = nextResult.cursor?.id;
  }

  return documents;
};

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

    // Dynamically list all collections
    const collectionsResult = (await db.$runCommandRaw({
      listCollections: 1,
      nameOnly: true,
    })) as MongoCommandResult;

    const collectionNames = (collectionsResult.cursor?.firstBatch ?? [])
      .map((entry: any) => entry?.name)
      .filter((name: unknown): name is string => typeof name === "string");

    // Fetch all documents from each collection SEQUENTIALLY
    // (parallel fetching causes cursor timeouts on the server)
    const collectionEntries: [string, unknown[]][] = [];

    for (const collectionName of collectionNames) {
      const documents = await getCollectionDocuments(collectionName);
      collectionEntries.push([collectionName, documents]);
    }

    const collections = Object.fromEntries(collectionEntries);
    const counts = Object.fromEntries(
      collectionEntries.map(([name, docs]) => [name, docs.length])
    );

    const backup = {
      exportDate: new Date().toISOString(),
      collections,
      counts,
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
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}
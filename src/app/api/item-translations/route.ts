import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { auth } from "../../../../auth";

export const dynamic = 'force-dynamic';

// GET - Fetch all item translations
export async function GET() {
  try {
    const translations = await db.itemTranslation.findMany({
      orderBy: { englishName: 'asc' },
    });
    return NextResponse.json(translations);
  } catch (error) {
    console.error('Failed to fetch item translations:', error);
    return NextResponse.json({ error: 'Failed to fetch item translations' }, { status: 500 });
  }
}

// POST - Create a new item translation
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { englishName, urduName } = body;

    if (!englishName?.trim() || !urduName?.trim()) {
      return NextResponse.json({ error: 'Both English and Urdu names are required' }, { status: 400 });
    }

    // Check if english name already exists (case-insensitive)
    const existing = await db.itemTranslation.findFirst({
      where: { englishName: { equals: englishName.trim(), mode: 'insensitive' } },
    });

    if (existing) {
      return NextResponse.json({ error: 'This English item name already exists' }, { status: 409 });
    }

    const translation = await db.itemTranslation.create({
      data: {
        englishName: englishName.trim(),
        urduName: urduName.trim(),
      },
    });

    return NextResponse.json(translation, { status: 201 });
  } catch (error) {
    console.error('Failed to create item translation:', error);
    return NextResponse.json({ error: 'Failed to create item translation' }, { status: 500 });
  }
}

// PUT - Update an existing item translation
export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { id, englishName, urduName } = body;

    if (!id || !englishName?.trim() || !urduName?.trim()) {
      return NextResponse.json({ error: 'ID, English name, and Urdu name are required' }, { status: 400 });
    }

    // Check if another record with same english name exists
    const existing = await db.itemTranslation.findFirst({
      where: {
        englishName: { equals: englishName.trim(), mode: 'insensitive' },
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'This English item name already exists' }, { status: 409 });
    }

    const translation = await db.itemTranslation.update({
      where: { id },
      data: {
        englishName: englishName.trim(),
        urduName: urduName.trim(),
      },
    });

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Failed to update item translation:', error);
    return NextResponse.json({ error: 'Failed to update item translation' }, { status: 500 });
  }
}

// DELETE - Delete an item translation
export async function DELETE(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.itemTranslation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item translation:', error);
    return NextResponse.json({ error: 'Failed to delete item translation' }, { status: 500 });
  }
}
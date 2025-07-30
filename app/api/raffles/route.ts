// app/api/raffles/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put, del } from "@vercel/blob";

const prisma = new PrismaClient();

// Helper function with detailed error logging
function handleError(error: unknown, context: string) {
  console.error(`[${context}] Error:`, error);
  return NextResponse.json(
    {
      error: "Operation failed",
      details: error instanceof Error ? error.message : String(error),
      context,
    },
    { status: 500 }
  );
}

// Validação de carteira cripto (suporta Ethereum, Solana, Bitcoin)
function validateCryptoWallet(wallet: string): boolean {
  // Ethereum (0x...) - 42 caracteres
  if (/^0x[a-fA-F0-9]{40}$/.test(wallet)) return true;

  // Solana (base58) - 32-44 caracteres
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) return true;

  // Bitcoin (1, 3, bc1) - 25-62 caracteres
  if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(wallet)) return true;

  return false;
}

// GET - List all raffles
export async function GET() {
  try {
    const raffles = await prisma.raffle.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(raffles);
  } catch (error) {
    return handleError(error, "GET raffles");
  }
}

// POST - Create new raffle with image
export async function POST(request: Request) {
  let blobId: string | null = null;

  try {
    const formData = await request.formData();
    const title = formData.get("title")?.toString()?.trim();
    const content = formData.get("content")?.toString()?.trim();
    const category = formData.get("category")?.toString()?.trim();
    const wallet = formData.get("wallet")?.toString()?.trim();
    const file = formData.get("file") as File | null;

    // Validation
    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: "Title is required and must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!wallet || !validateCryptoWallet(wallet)) {
      return NextResponse.json(
        {
          error:
            "Valid crypto wallet address is required (supports Ethereum, Solana, Bitcoin formats)",
        },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "A valid image file is required" },
        { status: 400 }
      );
    }

    if (category && category.length > 16) {
      return NextResponse.json(
        { error: "Category must be 16 characters or less" },
        { status: 400 }
      );
    }

    if (content && content.length > 10000) {
      return NextResponse.json(
        { error: "Content too long (max 10000 characters)" },
        { status: 400 }
      );
    }

    // 1. Upload to Vercel Blob
    const { url, pathname } = await put(file.name, file, { access: "public" });
    blobId = pathname;

    // 2. Create in database
    const raffle = await prisma.raffle.create({
      data: {
        title,
        content: content || null,
        category: category || "general",
        wallet, // Novo campo
        coverImageUrl: url,
        coverImageId: pathname,
      },
    });

    return NextResponse.json(raffle, { status: 201 });
  } catch (error) {
    // Clean up blob if DB operation failed
    if (blobId) {
      try {
        await del(blobId);
      } catch (cleanupError) {
        console.error("Blob cleanup failed:", cleanupError);
      }
    }
    return handleError(error, "POST raffle");
  }
}

// PUT - Update existing raffle (with optional fields)
export async function PUT(request: Request) {
  let newBlobId: string | null = null;
  let oldBlobId: string | null = null;

  try {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const title = formData.get("title")?.toString()?.trim();
    const content = formData.get("content")?.toString()?.trim();
    const category = formData.get("category")?.toString()?.trim();
    const wallet = formData.get("wallet")?.toString()?.trim();
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const raffleId = parseInt(id);
    if (isNaN(raffleId)) {
      return NextResponse.json({ error: "Invalid raffle ID" }, { status: 400 });
    }

    // Validate wallet format if provided
    if (wallet && !validateCryptoWallet(wallet)) {
      return NextResponse.json(
        { error: "Invalid crypto wallet address format" },
        { status: 400 }
      );
    }

    // Validate at least one field is being updated
    if (!title && !content && !category && !wallet && !file) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (title && title.length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (category && category.length > 16) {
      return NextResponse.json(
        { error: "Category must be 16 characters or less" },
        { status: 400 }
      );
    }

    if (content && content.length > 10000) {
      return NextResponse.json(
        { error: "Content too long (max 10000 characters)" },
        { status: 400 }
      );
    }

    // Get existing raffle
    const existing = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    oldBlobId = existing.coverImageId;

    // Handle image update
    let imageUrl = existing.coverImageUrl;
    let imageId = existing.coverImageId;

    if (file) {
      // Upload new image
      const { url, pathname } = await put(file.name, file, {
        access: "public",
      });
      newBlobId = pathname;
      imageUrl = url;
      imageId = pathname;
    }

    // Prepare update data
    const updateData: {
      title?: string;
      content?: string | null;
      category?: string;
      wallet?: string;
      coverImageUrl?: string;
      coverImageId?: string;
    } = {};

    // Only include fields that were provided
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content || null;
    if (category !== undefined) updateData.category = category;
    if (wallet !== undefined) updateData.wallet = wallet;
    if (file) {
      updateData.coverImageUrl = imageUrl;
      updateData.coverImageId = imageId;
    }

    // Update in database
    const updated = await prisma.raffle.update({
      where: { id: raffleId },
      data: updateData,
    });

    // Delete old blob if new one was uploaded
    if (file && oldBlobId) {
      try {
        await del(oldBlobId);
      } catch (cleanupError) {
        console.error("Old blob cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    // Clean up new blob if operation failed
    if (newBlobId) {
      try {
        await del(newBlobId);
      } catch (cleanupError) {
        console.error("New blob cleanup failed:", cleanupError);
      }
    }
    return handleError(error, "PUT raffle");
  }
}

// DELETE - Remove raffle
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const raffleId = parseInt(id);
    if (isNaN(raffleId)) {
      return NextResponse.json({ error: "Invalid raffle ID" }, { status: 400 });
    }

    // Get raffle to be deleted
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 });
    }

    // Delete from blob storage
    if (raffle.coverImageId) {
      await del(raffle.coverImageId);
    }

    // Delete from database
    await prisma.raffle.delete({
      where: { id: raffleId },
    });

    return NextResponse.json({
      success: true,
      message: "Raffle deleted successfully",
    });
  } catch (error) {
    return handleError(error, "DELETE raffle");
  }
}

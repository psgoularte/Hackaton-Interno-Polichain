import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

const prisma = new PrismaClient();

// ✅ GET - Lista todas as rifas
export async function GET() {
  try {
    const raffles = await prisma.raffle.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Serializa BigInt para string
    const serialized = raffles.map((r) => ({
      ...r,
      ticketPrize: r.ticketPrize.toString(),
      prizeValue: r.prizeValue.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Erro ao buscar rifas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar rifas" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Atualiza uma rifa existente
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    const formData = await req.formData();
    const updateData: any = {};

    if (formData.get("title"))
      updateData.title = formData.get("title")?.toString();
    if (formData.get("description"))
      updateData.content = formData.get("description")?.toString();
    if (formData.get("category"))
      updateData.category = formData.get("category")?.toString();
    if (formData.get("wallet"))
      updateData.wallet = formData.get("wallet")?.toString();
    if (formData.get("address"))
      updateData.address = formData.get("address")?.toString();
    if (formData.get("ticketPrize"))
      updateData.ticketPrize = BigInt(formData.get("ticketPrize")!.toString());
    if (formData.get("prizeValue"))
      updateData.prizeValue = BigInt(formData.get("prizeValue")!.toString());
    if (formData.get("duration"))
      updateData.duration = parseInt(formData.get("duration")!.toString());
    if (formData.get("maxTickets"))
      updateData.maxTickets = parseInt(formData.get("maxTickets")!.toString());
    if (formData.get("targetAmount"))
      updateData.targetAmount = parseFloat(
        formData.get("targetAmount")!.toString()
      );

    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      const blob = await put(
        `raffles/${Date.now()}-${imageFile.name}`,
        imageFile,
        {
          access: "public",
        }
      );
      updateData.coverImageUrl = blob.url;
      updateData.coverImageId = blob.pathname;
    }

    const updated = await prisma.raffle.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      ticketPrize: updated.ticketPrize.toString(),
      prizeValue: updated.prizeValue.toString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar rifa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar rifa" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Remove uma rifa por ID (e a imagem, se quiser)
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    const existing = await prisma.raffle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Rifa não encontrada" },
        { status: 404 }
      );
    }

    // Opcional: deleta a imagem do Vercel Blob
    if (existing.coverImageId) {
      await del(existing.coverImageId);
    }

    await prisma.raffle.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar rifa:", error);
    return NextResponse.json(
      { error: "Erro ao deletar rifa" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const content = formData.get("description")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    const wallet = formData.get("creator")?.toString() || "";
    const address = formData.get("raffleAddress")?.toString() || "";
    const ticketPrize = BigInt(formData.get("ticketPrice")?.toString() || "0");
    const prizeValue = BigInt(formData.get("prizeValue")?.toString() || "0");
    const duration = parseInt(formData.get("duration")?.toString() || "0");
    const maxTickets = parseInt(formData.get("maxTickets")?.toString() || "0");
    const targetAmount = parseFloat(
      formData.get("targetAmount")?.toString() || "0"
    );

    let imageUrl = "";
    let imageId = "";

    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      const blob = await put(
        `raffles/${Date.now()}-${imageFile.name}`,
        imageFile,
        {
          access: "public",
        }
      );
      imageUrl = blob.url;
      imageId = blob.pathname;
    }

    const raffle = await prisma.raffle.create({
      data: {
        title,
        content,
        category,
        wallet,
        address,
        ticketPrize,
        prizeValue,
        duration,
        maxTickets,
        targetAmount,
        coverImageUrl: imageUrl,
        coverImageId: imageId,
      },
    });

    return NextResponse.json({
      ...raffle,
      ticketPrize: raffle.ticketPrize.toString(),
      prizeValue: raffle.prizeValue.toString(),
    });
  } catch (error) {
    console.error("Erro ao criar rifa:", error);
    return NextResponse.json({ error: "Erro ao criar rifa" }, { status: 500 });
  }
}

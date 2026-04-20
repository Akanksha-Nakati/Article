import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateReadTime } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const article = await db.article.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      author: { select: { name: true, avatarUrl: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, subtitle, bodyHtml, bodyJson, tags, status, coverImageUrl, restore } =
    body;

  const existing = await db.article.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const readTimeMins =
    bodyHtml !== undefined
      ? calculateReadTime(bodyHtml)
      : existing.readTimeMins;

  const publishedAt =
    status === "PUBLISHED" && existing.publishedAt === null
      ? new Date()
      : existing.publishedAt;

  if (tags !== undefined) {
    await db.articleTag.deleteMany({ where: { articleId: params.id } });
    for (const name of tags as string[]) {
      const tagSlug = name.toLowerCase().replace(/\s+/g, "-");
      const tag = await db.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name, slug: tagSlug },
      });
      await db.articleTag.create({
        data: { articleId: params.id, tagId: tag.id },
      });
    }
  }

  const article = await db.article.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(bodyHtml !== undefined && { bodyHtml }),
      ...(bodyJson !== undefined && { bodyJson }),
      ...(coverImageUrl !== undefined && { coverImageUrl }),
      ...(status !== undefined && {
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      }),
      // Restore from soft-delete
      ...(restore === true && { deletedAt: null }),
      readTimeMins,
      publishedAt,
      updatedAt: new Date(),
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.article.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Soft delete — sets deletedAt timestamp, record stays in DB
  const article = await db.article.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true, deletedAt: article.deletedAt });
}

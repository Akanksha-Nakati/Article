import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { uniqueSlug, calculateReadTime } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = !!session?.user;

  const articles = await db.article.findMany({
    where: isAdmin ? {} : { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      tags: { include: { tag: true } },
      author: { select: { name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    subtitle,
    bodyHtml,
    bodyJson,
    tags,
    status,
    coverImageUrl,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = await uniqueSlug(title, async (s) => {
    const existing = await db.article.findUnique({ where: { slug: s } });
    return !!existing;
  });

  const readTimeMins = calculateReadTime(bodyHtml ?? "");

  let user = await db.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: session.user.email!,
        name: session.user.name ?? null,
        avatarUrl: session.user.image ?? null,
      },
    });
  }

  const publishedAt =
    status === "PUBLISHED" ? new Date() : null;

  const article = await db.article.create({
    data: {
      title,
      subtitle: subtitle ?? null,
      slug,
      bodyHtml: bodyHtml ?? "",
      bodyJson: bodyJson ?? undefined,
      coverImageUrl: coverImageUrl ?? null,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      readTimeMins,
      publishedAt,
      authorId: user.id,
      tags: {
        create: await buildTagConnections(tags ?? []),
      },
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(article, { status: 201 });
}

async function buildTagConnections(tagNames: string[]) {
  const connections = [];
  for (const name of tagNames) {
    const tagSlug = name.toLowerCase().replace(/\s+/g, "-");
    const tag = await db.tag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: { name, slug: tagSlug },
    });
    connections.push({ tagId: tag.id });
  }
  return connections;
}

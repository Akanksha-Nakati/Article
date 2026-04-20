import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToStorage } from "@/lib/storage";
import { db } from "@/lib/db";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const articleId = formData.get("articleId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const maxWidth = 1600;
  const needsResize = metadata.width && metadata.width > maxWidth;

  const processed = needsResize
    ? image.resize({ width: maxWidth, withoutEnlargement: true })
    : image;

  const outputBuffer = await processed
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });

  const ext = "webp";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${uuidv4()}-${safeName}.${ext}`;

  const url = await uploadToStorage(key, outputBuffer.data, "image/webp");

  await db.image.create({
    data: {
      storageKey: key,
      url,
      altText: file.name,
      width: outputBuffer.info.width,
      height: outputBuffer.info.height,
      ...(articleId ? { articleId } : {}),
    },
  });

  return NextResponse.json({
    url,
    width: outputBuffer.info.width,
    height: outputBuffer.info.height,
  });
}

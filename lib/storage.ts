import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const bucket = process.env.R2_BUCKET_NAME ?? "";
const publicUrl = process.env.R2_PUBLIC_URL ?? "";

export async function uploadToStorage(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${publicUrl}/${key}`;
}

export async function deleteFromStorage(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

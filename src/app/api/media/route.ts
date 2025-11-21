import { NextResponse, NextRequest } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createId as cuid } from "@paralleldrive/cuid2";

const MAX_FILE_SIZE = 600 * 1024; // 600KB
const MAX_QUOTA_BYTES = 6 * 1024 * 1024 * 1024; // 6GB
const URL_EXPIRATION_SECONDS = 3600; // 1 hour

const s3 = new S3Client({
  endpoint: process.env.B2_ENDPOINT!,
  region: process.env.B2_REGION!,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
});

// --- GET: Fetch Media with Pagination & Stats ---
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "CASHIER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12"); // Default 12 items per page
  const skip = (page - 1) * limit;

  // 1. Get Stats
  const totalUsage = await prisma.media.aggregate({ _sum: { size: true } });
  const totalCount = await prisma.media.count();
  const usedBytes = totalUsage._sum.size || 0;

  // 2. Get Paginated Files
  const mediaFiles = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  // 3. Sign URLs
  const filesWithSignedUrls = await Promise.all(
    mediaFiles.map(async (file) => {
      const command = new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: file.filename,
      });
      const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: URL_EXPIRATION_SECONDS,
      });
      return { ...file, url: signedUrl };
    }),
  );

  return NextResponse.json({
    usedBytes,
    quotaBytes: MAX_QUOTA_BYTES,
    usagePercentage: (usedBytes / MAX_QUOTA_BYTES) * 100,
    totalFiles: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    files: filesWithSignedUrls,
  });
}

// --- POST: Upload (Same as before, included for completeness) ---
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/"))
      return NextResponse.json(
        { error: "Only images allowed" },
        { status: 400 },
      );
    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json(
        { error: "File exceeds 600KB" },
        { status: 400 },
      );

    const usage = await prisma.media.aggregate({ _sum: { size: true } });
    if ((usage._sum.size || 0) + file.size > MAX_QUOTA_BYTES)
      return NextResponse.json(
        { error: "Storage quota exceeded" },
        { status: 400 },
      );

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const uniqueFilename = `${cuid()}.${fileExt}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    // Generate signed URL immediately for UI
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: uniqueFilename,
    });
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: URL_EXPIRATION_SECONDS,
    });

    const media = await prisma.media.create({
      data: {
        filename: uniqueFilename,
        url: `${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET_NAME}/${uniqueFilename}`,
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ ...media, url: signedUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// --- ✅ NEW: DELETE Method ---
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // 1. Find the file in DB to get the filename
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media)
      return NextResponse.json({ error: "File not found" }, { status: 404 });

    // 2. Delete from Backblaze B2
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: media.filename,
      }),
    );

    // 3. Delete from Database
    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createId as cuid } from "@paralleldrive/cuid2";

// Constants
const MAX_FILE_SIZE = 600 * 1024; // 600KB
const MAX_QUOTA_BYTES = 8 * 1024 * 1024 * 1024;
const URL_EXPIRATION_SECONDS = 3600;

const s3 = new S3Client({
  endpoint: process.env.B2_ENDPOINT!,
  region: process.env.B2_REGION!,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
});

// GET: Get Media Stats and Recent Files with Presigned URLs
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "CASHIER")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalUsage = await prisma.media.aggregate({
    _sum: { size: true },
  });

  const usedBytes = totalUsage._sum.size || 0;

  // Fetch recent media metadata from DB
  const recentMedia = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // ✅ GENERATE SIGNED URLS
  // We iterate over the database results and generate a temporary accessible URL for each.
  const filesWithSignedUrls = await Promise.all(
    recentMedia.map(async (file) => {
      const command = new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: file.filename,
      });

      // Generate the temporary URL
      const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: URL_EXPIRATION_SECONDS,
      });

      return {
        ...file,
        url: signedUrl, // Replace the stored URL with the working signed URL for the frontend
      };
    }),
  );

  return NextResponse.json({
    usedBytes,
    quotaBytes: MAX_QUOTA_BYTES,
    usagePercentage: (usedBytes / MAX_QUOTA_BYTES) * 100,
    files: filesWithSignedUrls,
  });
}

// POST: Upload File Privately
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 600KB limit." },
        { status: 400 },
      );
    }

    const usage = await prisma.media.aggregate({ _sum: { size: true } });
    if ((usage._sum.size || 0) + file.size > MAX_QUOTA_BYTES) {
      return NextResponse.json(
        { error: "Storage quota exceeded (6GB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const uniqueFilename = `${cuid()}.${fileExt}`;

    // 4. Upload to Backblaze B2 (Private)
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: file.type,
        // ❌ ACL removed. The bucket is private by default.
      }),
    );

    // 5. Generate a Signed URL for immediate display in the UI
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: uniqueFilename,
    });
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: URL_EXPIRATION_SECONDS,
    });

    // 6. Save to DB
    // We store the filename (Key) mostly, but we keep the base URL structure for reference.
    // However, the 'url' field in the DB is technically not usable directly for private buckets.
    const media = await prisma.media.create({
      data: {
        filename: uniqueFilename,
        url: `${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET_NAME}/${uniqueFilename}`,
        size: file.size,
        mimeType: file.type,
      },
    });

    // Return the media object, but swap the URL for the signed one so the frontend can see it immediately
    return NextResponse.json({
      ...media,
      url: signedUrl,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

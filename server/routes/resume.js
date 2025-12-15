import express from "express";
import { nanoid } from "nanoid";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../aws/s3Client.js";
import { setUserResume, getUserResume } from "../data/users.js";

const router = express.Router();

const BUCKET = process.env.S3_BUCKET_NAME;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function safeName(name = "resume") {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
}

// 1) Get presigned PUT URL
router.post("/presign-upload", async (req, res) => {
  try {
    const { filename, contentType, size } = req.body;

    const userId = req.user.id;
    const key = `resumes/${userId}/${Date.now()}-${nanoid(10)}-${safeName(
      filename
    )}`;

    if (!filename || !contentType) {
      return res
        .status(400)
        .json({ error: "filename and contentType required" });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }
    if (typeof size === "number" && size > MAX_UPLOAD_BYTES) {
      return res.status(400).json({ error: "File too large" });
    }    

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      // optional: metadata tags you might like for debugging
      Metadata: { userId },
    });

    // Presigned URLs grant time-limited access without changing bucket policy
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 }); // 5 min :contentReference[oaicite:5]{index=5}

    // Option A (simple): store key immediately (overwrites prior resume)
    await setUserResume(userId, {
      s3Key: key,
      originalFilename: filename,
      contentType,
      uploadedAt: new Date().toISOString(),
    });

    return res.json({ key, uploadUrl, expiresIn: 300 });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to create presigned upload URL" });
  }
});

// 2) Get presigned GET URL (download)
router.get("/download-url", async (req, res) => {
  try {
    const userId = req.user.id;

    const resume = await getUserResume(userId);
    if (!resume?.s3Key) {
      return res.status(404).json({ error: "No resume on file" });
    }

    const cmd = new GetObjectCommand({
      Bucket: BUCKET,
      Key: resume.s3Key,
      ResponseContentDisposition: `inline; filename="${safeName(
        resume.originalFilename
      )}"`,
    });

    const downloadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 });
    return res.json({ downloadUrl, expiresIn: 300 });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to create presigned download URL" });
  }
});

export default router;

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration Scaleway Object Storage (compatible S3)
const S3_REGION = process.env.S3_REGION || "fr-par";
const S3_ENDPOINT = process.env.S3_ENDPOINT || `https://s3.${S3_REGION}.scw.cloud`;
const S3_BUCKET = process.env.S3_BUCKET || "ambubook-attachments";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "";

// Client S3 singleton
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!S3_ACCESS_KEY || !S3_SECRET_KEY) {
      throw new Error("S3 credentials not configured. Set S3_ACCESS_KEY and S3_SECRET_KEY environment variables.");
    }

    s3Client = new S3Client({
      region: S3_REGION,
      endpoint: S3_ENDPOINT,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
      forcePathStyle: true, // Nécessaire pour Scaleway
    });
  }
  return s3Client;
}

// Générer une clé unique pour le fichier
export function generateFileKey(requestId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `requests/${requestId}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
}

// Upload un fichier vers S3
export async function uploadToS3(
  fileKey: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<void> {
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await client.send(command);
}

// Supprimer un fichier de S3
export async function deleteFromS3(fileKey: string): Promise<void> {
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
  });

  await client.send(command);
}

// Générer une URL signée pour télécharger un fichier (valide 1h)
export async function getSignedDownloadUrl(fileKey: string, expiresIn = 3600): Promise<string> {
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
  });

  return getSignedUrl(client, command, { expiresIn });
}

// Vérifier si S3 est configuré
export function isS3Configured(): boolean {
  return Boolean(S3_ACCESS_KEY && S3_SECRET_KEY);
}

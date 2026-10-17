// Storage for the admin panel: content.json and uploaded photos live in a
// dedicated public-read S3 bucket. The client, presigner, clock and RNG are
// injectable so the logic is testable without AWS.

import { randomBytes } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const coded = (message, code) => Object.assign(new Error(message), { code });

export function createS3(env = process.env, deps = {}) {
  const bucket = env.S3_BUCKET;
  const region = env.PUCHU_AWS_REGION;
  const presign = deps.presign || createPresignedPost;
  const now = deps.now || Date.now;
  const rand = deps.rand || (() => randomBytes(4).toString('hex'));
  let client = deps.client;

  const ready = () => {
    if (!bucket || !region) throw coded('storage not configured', 'NOT_CONFIGURED');
    if (!client) {
      if (!env.PUCHU_AWS_ACCESS_KEY_ID || !env.PUCHU_AWS_SECRET_ACCESS_KEY) {
        throw coded('storage not configured', 'NOT_CONFIGURED');
      }
      client = new S3Client({
        region,
        credentials: {
          accessKeyId: env.PUCHU_AWS_ACCESS_KEY_ID,
          secretAccessKey: env.PUCHU_AWS_SECRET_ACCESS_KEY,
        },
      });
    }
    return client;
  };

  const base = `https://${bucket}.s3.${region}.amazonaws.com`;

  return {
    contentUrl: `${base}/content.json`,

    async putContent(doc) {
      await ready().send(new PutObjectCommand({
        Bucket: bucket,
        Key: 'content.json',
        Body: JSON.stringify(doc),
        ContentType: 'application/json',
        CacheControl: 'public, max-age=30',
      }));
    },

    // A presigned POST (not PUT) so S3 itself enforces the size cap and type.
    async buildUploadPost(contentType) {
      const ext = typeof contentType === 'string' ? EXT[contentType] : undefined;
      if (!ext) throw coded('Unsupported image type (use JPEG, PNG or WebP)', 'BAD_TYPE');
      const c = ready();
      const key = `photos/${now()}-${rand()}.${ext}`;
      const { url, fields } = await presign(c, {
        Bucket: bucket,
        Key: key,
        Conditions: [
          ['content-length-range', 1, MAX_UPLOAD_BYTES],
          ['eq', '$Content-Type', contentType],
        ],
        Fields: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
        Expires: 300,
      });
      return { url, fields, publicUrl: `${base}/${key}` };
    },
  };
}

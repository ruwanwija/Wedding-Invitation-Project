import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient, STORAGE_BUCKETS, type StorageBucket } from '@/lib/api/helpers';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MIME_BY_BUCKET: Record<StorageBucket, string[]> = {
  'bride-groom-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/pjpeg', 'image/x-png', 'image/jfif'],
  'gallery-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/pjpeg', 'image/x-png', 'image/jfif'],
  'timeline-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/pjpeg', 'image/x-png', 'image/jfif'],
  'music-tracks': ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav'],
  'qr-codes': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/pjpeg', 'image/x-png'],
};

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const { client, error: clientError } = ensureAdminClient();
  if (clientError) return clientError;

  const formData = await request.formData();
  const file = formData.get('file');
  const bucket = formData.get('bucket') as string;
  const replacePath = formData.get('replacePath') as string | null;

  if (!(file instanceof File)) {
    console.warn("Upload failed validation: Not a File instance", { file });
    return jsonError('A file is required.');
  }

  if (!STORAGE_BUCKETS.includes(bucket as StorageBucket)) {
    console.warn("Upload failed validation: Invalid bucket name", { bucket });
    return jsonError('Invalid storage bucket.');
  }

  const typedBucket = bucket as StorageBucket;
  const allowedMimes = MIME_BY_BUCKET[typedBucket];

  // Resolve dynamic mime type if browser-submitted mime is generic or empty
  let fileMimeType = file.type;
  if (!fileMimeType || fileMimeType === 'application/octet-stream') {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'png') fileMimeType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg' || ext === 'jfif') fileMimeType = 'image/jpeg';
    else if (ext === 'webp') fileMimeType = 'image/webp';
    else if (ext === 'gif') fileMimeType = 'image/gif';
    else if (ext === 'mp3') fileMimeType = 'audio/mp3';
    else if (ext === 'wav') fileMimeType = 'audio/wav';
    else if (ext === 'ogg') fileMimeType = 'audio/ogg';
    else if (ext === 'svg') fileMimeType = 'image/svg+xml';
  }

  if (!allowedMimes.includes(fileMimeType)) {
    console.warn("Upload failed validation: Disallowed MIME type", { fileMimeType, fileType: file.type, fileName: file.name, bucket });
    return jsonError(`File type ${fileMimeType || '(unknown)'} is not allowed for bucket ${bucket}.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    console.warn("Upload failed validation: File too large", { size: file.size, limit: MAX_FILE_SIZE });
    return jsonError('File exceeds the 10 MB size limit.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const filePath =
    replacePath?.trim() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  if (replacePath) {
    await client.storage.from(typedBucket).remove([replacePath]);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await client.storage
    .from(typedBucket)
    .upload(filePath, buffer, {
      contentType: fileMimeType || file.type,
      upsert: !!replacePath,
    });

  if (uploadError) {
    return jsonError(uploadError.message, 500);
  }

  const { data: urlData } = client.storage.from(typedBucket).getPublicUrl(filePath);

  return jsonOk({
    path: filePath,
    url: urlData.publicUrl,
    bucket: typedBucket,
  }, 201);
}

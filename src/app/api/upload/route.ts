import { NextRequest } from 'next/server';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth/apiAuth';
import { ensureAdminClient, STORAGE_BUCKETS, type StorageBucket } from '@/lib/api/helpers';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MIME_BY_BUCKET: Record<StorageBucket, string[]> = {
  'bride-groom-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'gallery-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'timeline-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'music-tracks': ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  'qr-codes': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
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
    return jsonError('A file is required.');
  }

  if (!STORAGE_BUCKETS.includes(bucket as StorageBucket)) {
    return jsonError('Invalid storage bucket.');
  }

  const typedBucket = bucket as StorageBucket;
  const allowedMimes = MIME_BY_BUCKET[typedBucket];

  if (!allowedMimes.includes(file.type)) {
    return jsonError(`File type ${file.type} is not allowed for bucket ${bucket}.`);
  }

  if (file.size > MAX_FILE_SIZE) {
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
      contentType: file.type,
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

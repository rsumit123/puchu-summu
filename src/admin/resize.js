// Shrinks a photo in the browser before upload: phone photos are several MB,
// and the page only ever shows them at a few hundred pixels.

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function resizeImage(file, maxDim = 1600, quality = 0.85) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image file');

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Could not read that image — try a JPEG or PNG');
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Could not process that image');
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error('That photo is still too large after resizing');
  return blob;
}

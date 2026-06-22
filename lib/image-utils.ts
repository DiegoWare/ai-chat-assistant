export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Only JPEG, PNG, WebP, and GIF images are supported.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Each image must be 4 MB or smaller.";
  }

  return null;
}

export function filesToFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  return dataTransfer.files;
}

export async function compressImage(file: File, maxWidth = 1600, quality = 0.8) {
  const image = document.createElement("img");
  const blobUrl = URL.createObjectURL(file);
  image.src = blobUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load image"));
  });

  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob(
      (result) => resolve(result ?? file),
      "image/jpeg",
      quality
    )
  );

  URL.revokeObjectURL(blobUrl);

  return new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
    type: "image/jpeg"
  });
}

export function isVideo(file: File) {
  return file.type.startsWith("video/");
}

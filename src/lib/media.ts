/**
 * Read EXIF orientation from JPEG file.
 * Returns orientation value 1-8, or 1 (normal) if not found.
 * This is a minimal EXIF reader — no dependency needed.
 */
function readExifOrientation(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  // Check JPEG SOI marker
  if (view.getUint16(0) !== 0xffd8) return 1;
  let offset = 2;
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset);
    offset += 2;
    if (marker === 0xffe1) {
      // APP1 — potential EXIF
      const length = view.getUint16(offset);
      const exifStart = offset + 2;
      // Check "Exif\0\0"
      if (
        view.getUint32(exifStart) === 0x45786966 &&
        view.getUint16(exifStart + 4) === 0x0000
      ) {
        const tiffStart = exifStart + 6;
        const bigEndian = view.getUint16(tiffStart) === 0x4d4d;
        const ifdOffset = view.getUint32(tiffStart + 4, !bigEndian);
        const entries = view.getUint16(tiffStart + ifdOffset, !bigEndian);
        for (let i = 0; i < entries; i++) {
          const entryOffset = tiffStart + ifdOffset + 2 + i * 12;
          if (entryOffset + 12 > view.byteLength) break;
          const tag = view.getUint16(entryOffset, !bigEndian);
          if (tag === 0x0112) {
            // Orientation tag
            return view.getUint16(entryOffset + 8, !bigEndian);
          }
        }
      }
      offset += length;
    } else if ((marker & 0xff00) === 0xff00) {
      const length = view.getUint16(offset);
      offset += length;
    } else {
      break;
    }
  }
  return 1;
}

/**
 * Apply EXIF orientation transform to canvas context.
 */
function applyOrientation(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
) {
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, height, width); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
  }
}

/**
 * Compress, auto-orient, and strip EXIF from an image.
 * Optionally adds a small watermark with timestamp + inspector name.
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.8,
  watermark?: { inspectorName: string }
) {
  const buffer = await file.arrayBuffer();
  const orientation = readExifOrientation(buffer);

  const image = document.createElement("img");
  const blobUrl = URL.createObjectURL(file);
  image.src = blobUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load image"));
  });

  // For orientations 5-8, width and height are swapped
  const swapped = orientation >= 5;
  const origW = swapped ? image.height : image.width;
  const origH = swapped ? image.width : image.height;

  const scale = Math.min(1, maxWidth / origW);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(origW * scale);
  canvas.height = Math.round(origH * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Apply orientation correction
  if (orientation > 1) {
    applyOrientation(ctx, orientation, canvas.width, canvas.height);
  }

  // Draw with correct dimensions (use original image dims since orientation is applied via transform)
  if (swapped) {
    ctx.drawImage(image, 0, 0, canvas.height, canvas.width);
  } else {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  // Add watermark if requested
  if (watermark) {
    const timestamp = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const text = `${timestamp} • ${watermark.inspectorName}`;
    const fontSize = Math.max(12, Math.round(canvas.width * 0.02));
    ctx.save();
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    const metrics = ctx.measureText(text);
    const x = canvas.width - metrics.width - 10;
    const y = canvas.height - 10;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

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

/**
 * Create a thumbnail data URL for immediate preview.
 * Much faster than full compression — used for inline confirmation.
 */
export async function createThumbnail(file: File, maxSize = 200): Promise<string> {
  const image = document.createElement("img");
  const blobUrl = URL.createObjectURL(file);
  image.src = blobUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load image for thumbnail"));
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(blobUrl);
  return canvas.toDataURL("image/jpeg", 0.6);
}

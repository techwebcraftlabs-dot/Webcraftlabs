const ALLOWED_SIGNATURES = {
  "image/jpeg": (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
  "image/png": (data) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (data) => data.length >= 12 && data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP",
  "application/pdf": (data) => data.length >= 5 && data.subarray(0, 5).toString("ascii") === "%PDF-",
};

const EXTENSIONS = {
  "image/jpeg": new Set(["jpg", "jpeg"]),
  "image/png": new Set(["png"]),
  "image/webp": new Set(["webp"]),
  "application/pdf": new Set(["pdf"]),
};

export const SAFE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const SAFE_ATTACHMENT_TYPES = new Set([...SAFE_IMAGE_TYPES, "application/pdf"]);

export function hasValidFileSignature(fileData, mimeType) {
  return Boolean(ALLOWED_SIGNATURES[mimeType]?.(fileData));
}

export function hasValidExtension(fileName, mimeType) {
  const extension = String(fileName || "").split(".").pop()?.toLowerCase();
  return Boolean(extension && EXTENSIONS[mimeType]?.has(extension));
}

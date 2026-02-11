import QRCode from "qrcode";

export async function generateQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 120,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" }
  });
}

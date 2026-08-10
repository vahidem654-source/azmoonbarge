/**
 * Minimal, dependency-free .docx reader:
 * docx is a ZIP archive containing word/document.xml.
 * We locate that entry in the ZIP central directory, inflate it if needed 
 * using browser-native DecompressionStream ('deflate-raw'),
 * and pull plain text out of the <w:t> tags paragraph by paragraph.
 */

export async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(arrayBuffer);
  const dv = new DataView(arrayBuffer);
  const EOCD_SIG = 0x06054b50;
  const CD_SIG = 0x02014b50;

  let eocdOffset = -1;
  const searchStart = Math.max(0, bytes.length - 65557);

  for (let i = bytes.length - 22; i >= searchStart; i--) {
    if (dv.getUint32(i, true) === EOCD_SIG) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('این فایل یک فایل Word معتبر (.docx) نیست.');
  }

  const cdCount = dv.getUint16(eocdOffset + 10, true);
  let ptr = dv.getUint32(eocdOffset + 16, true);
  let target = null;

  for (let i = 0; i < cdCount; i++) {
    if (dv.getUint32(ptr, true) !== CD_SIG) break;
    const compMethod = dv.getUint16(ptr + 10, true);
    const compSize = dv.getUint32(ptr + 20, true);
    const nameLen = dv.getUint16(ptr + 28, true);
    const extraLen = dv.getUint16(ptr + 30, true);
    const commentLen = dv.getUint16(ptr + 32, true);
    const localHeaderOffset = dv.getUint32(ptr + 42, true);

    const name = new TextDecoder('utf-8').decode(bytes.slice(ptr + 46, ptr + 46 + nameLen));
    if (name === 'word/document.xml') {
      target = { compMethod, compSize, localHeaderOffset };
      break;
    }
    ptr += 46 + nameLen + extraLen + commentLen;
  }

  if (!target) {
    throw new Error('متن اصلی سند در این فایل Word پیدا نشد.');
  }

  const lh = target.localHeaderOffset;
  const lhNameLen = dv.getUint16(lh + 26, true);
  const lhExtraLen = dv.getUint16(lh + 28, true);
  const dataStart = lh + 30 + lhNameLen + lhExtraLen;
  const compData = bytes.slice(dataStart, dataStart + target.compSize);

  let xmlBytes: Uint8Array;

  if (target.compMethod === 0) {
    xmlBytes = compData;
  } else if (target.compMethod === 8) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('مرورگر شما از باز کردن فایل Word پشتیبانی نمی‌کند؛ لطفاً از مرورگر جدیدتر استفاده کنید.');
    }
    const stream = new Blob([compData]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    xmlBytes = new Uint8Array(await new Response(stream).arrayBuffer());
  } else {
    throw new Error('روش فشرده‌سازی این فایل Word پشتیبانی نمی‌شود.');
  }

  const xmlText = new TextDecoder('utf-8').decode(xmlBytes);
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');

  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('خواندن محتوای فایل Word با خطا مواجه شد.');
  }

  const paragraphs = Array.from(doc.getElementsByTagName('w:p'));
  const lines = paragraphs.map((p) =>
    Array.from(p.getElementsByTagName('w:t'))
      .map((t) => t.textContent)
      .join('')
  );

  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

export type PortfolioImageTreatment = "default" | "mono" | "portrait";

type ImageSegmenter = import("@mediapipe/tasks-vision").ImageSegmenter;

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm";
const MODEL_PATH = "/models/selfie_segmenter.tflite";
const MAX_IMAGE_SIZE = 1800;
const MAX_PORTRAIT_SIZE = 1600;

let segmenterPromise: Promise<ImageSegmenter> | null = null;

async function getSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const { FilesetResolver, ImageSegmenter } = await import(
        "@mediapipe/tasks-vision"
      );
      const fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
      return ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: "CPU" },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        // Confidence mask berisi probabilitas 0–1 sehingga tepi potongan bisa
        // dibuat halus (anti-aliased) alih-alih biner tajam.
        outputConfidenceMasks: true,
      });
    })().catch((error) => {
      segmenterPromise = null;
      throw error;
    });
  }
  return segmenterPromise;
}

const clamp = (value: number, min = 0, max = 255) =>
  Math.min(max, Math.max(min, value));

// Probabilitas "orang" (0–1) dipetakan ke alpha dengan transisi sangat sempit
// (~1 px) supaya tepi potongan tetap tajam, hanya dihaluskan secukupnya agar
// tidak bergerigi.
function crispAlpha(value: number) {
  const t = Math.min(1, Math.max(0, (value - 0.44) / 0.12));
  return Math.round(t * t * (3 - 2 * t) * 255);
}

function canvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw Error("Browser tidak dapat memproses gambar.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return context;
}

function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function grayscalePixels(data: Uint8ClampedArray) {
  for (let index = 0; index < data.length; index += 4) {
    const gray =
      data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const value = clamp((gray - 127.5) * 1.08 + 127.5);
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }
}

async function toWebp(canvas: HTMLCanvasElement, quality = 0.86) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob || blob.type !== "image/webp")
    throw Error(
      "Browser ini belum mendukung konversi gambar ke WebP. Coba browser lain.",
    );
  return blob;
}

async function portraitCutout(source: HTMLCanvasElement) {
  const segmenter = await getSegmenter();
  let maskAlpha: Uint8ClampedArray | null = null;

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args[0];
    if (
      typeof msg === "string" &&
      /XNNPACK|TensorFlow Lite/.test(msg)
    )
      return;
    originalError.apply(console, args);
  };

  try {
    const result = segmenter.segment(source);
    try {
      // Confidence mask menyimpan probabilitas "orang" (0–1) sehingga tepi
      // potongan tetap halus. Category mask hanya dipakai sebagai fallback.
      const confidence = result.confidenceMasks?.[0] ?? null;
      const category = confidence ? null : (result.categoryMask ?? null);
      if (!confidence && !category)
        throw Error("Background foto belum dapat dipisahkan.");

      const maskWidth = confidence?.width ?? category!.width;
      const maskHeight = confidence?.height ?? category!.height;
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = maskWidth;
      maskCanvas.height = maskHeight;
      const maskContext = canvasContext(maskCanvas);
      const maskImage = maskContext.createImageData(maskWidth, maskHeight);

      if (confidence) {
        const values = confidence.getAsFloat32Array();
        for (let index = 0; index < values.length; index += 1) {
          const offset = index * 4;
          maskImage.data[offset] = 255;
          maskImage.data[offset + 1] = 255;
          maskImage.data[offset + 2] = 255;
          maskImage.data[offset + 3] = crispAlpha(values[index]);
        }
      } else {
        const pixels = category!.getAsUint8Array();
        for (let index = 0; index < pixels.length; index += 1) {
          const offset = index * 4;
          maskImage.data[offset] = 255;
          maskImage.data[offset + 1] = 255;
          maskImage.data[offset + 2] = 255;
          // selfie_segmenter memberi kategori 0 untuk orang dan bukan-0 untuk
          // latar belakang, jadi ambil nilai 0 sebagai area orang.
          maskImage.data[offset + 3] = pixels[index] === 0 ? 255 : 0;
        }
      }
      maskContext.putImageData(maskImage, 0, 0);

      // Resolusi mask mengikuti sumber, jadi penyalinan ini praktis 1:1.
      const scaledMask = document.createElement("canvas");
      scaledMask.width = source.width;
      scaledMask.height = source.height;
      const scaledContext = canvasContext(scaledMask);
      scaledContext.drawImage(
        maskCanvas,
        0,
        0,
        maskWidth,
        maskHeight,
        0,
        0,
        source.width,
        source.height,
      );

      maskAlpha = scaledContext.getImageData(
        0,
        0,
        source.width,
        source.height,
      ).data;
    } finally {
      result.close();
    }
  } catch {
    /* Segmentasi tidak tersedia atau gagal: lanjutkan tanpa mask latar belakang. */
  } finally {
    console.error = originalError;
  }

  const context = canvasContext(source);
  const image = context.getImageData(0, 0, source.width, source.height);
  const data = image.data;
  let detected = false;
  for (let index = 0, alphaIndex = 3; index < data.length; index += 4, alphaIndex += 4) {
    const gray =
      data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const value = clamp((gray - 127.5) * 1.08 + 127.5);
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    if (maskAlpha) {
      const opacity = maskAlpha[alphaIndex] / 255;
      data[index + 3] = Math.round(data[index + 3] * opacity);
      if (data[index + 3] > 8) detected = true;
    } else {
      detected = true;
    }
  }
  if (!detected)
    throw Error(
      "Tidak ada orang yang terdeteksi. Gunakan foto potret dengan pencahayaan yang jelas.",
    );

  context.putImageData(image, 0, 0);
  return source;
}

export async function preparePortfolioImage(
  file: File,
  treatment: PortfolioImageTreatment,
  onStage?: (stage: string) => void,
): Promise<Blob> {
  if (
    file.type === "image/svg+xml" ||
    (file.type && !file.type.startsWith("image/")) ||
    file.size > 10485760
  )
    throw Error("Pilih file gambar maksimal 10 MB (bukan SVG).");

  const bitmap = await createImageBitmap(file).catch(() => {
    throw Error(
      "Format gambar ini belum didukung browser. Coba JPG, PNG, atau WebP.",
    );
  });
  try {
    const size = fitWithin(
      bitmap.width,
      bitmap.height,
      treatment === "portrait" ? MAX_PORTRAIT_SIZE : MAX_IMAGE_SIZE,
    );
    let canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    canvasContext(canvas).drawImage(bitmap, 0, 0, size.width, size.height);

    if (treatment === "portrait") {
      onStage?.("Memproses foto…");
      canvas = await portraitCutout(canvas);
      onStage?.("Membuat potret hitam-putih…");
    } else if (treatment === "mono") {
      onStage?.("Membuat gambar hitam-putih…");
      const context = canvasContext(canvas);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      grayscalePixels(image.data);
      context.putImageData(image, 0, 0);
    }

    onStage?.("Mengubah foto ke WebP…");
    const blob = await toWebp(canvas, treatment === "portrait" ? 0.88 : 0.86);
    if (blob.size > 2097152)
      throw Error(
        "Gambar masih terlalu besar setelah dikonversi. Pilih gambar dengan ukuran lebih kecil.",
      );
    return blob;
  } finally {
    bitmap.close();
  }
}

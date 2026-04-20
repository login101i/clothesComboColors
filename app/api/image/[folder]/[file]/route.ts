import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

type Params = {
  folder: string;
  file: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Params }
) {
  const folder = decodeURIComponent(params.folder ?? "");
  const file = decodeURIComponent(params.file ?? "");

  if (!folder || !file) {
    return NextResponse.json({ error: "Brak parametrów folder/file." }, { status: 400 });
  }

  if (folder.includes("..") || file.includes("..")) {
    return NextResponse.json({ error: "Nieprawidłowa ścieżka." }, { status: 400 });
  }

  const ext = path.extname(file).toLowerCase();
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) {
    return NextResponse.json({ error: "Nieobsługiwany format pliku." }, { status: 400 });
  }

  const imagePath = path.join(process.cwd(), "app", "pictures", folder, file);

  try {
    const data = await fs.readFile(imagePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Nie znaleziono pliku." }, { status: 404 });
  }
}

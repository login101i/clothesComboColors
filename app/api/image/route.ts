import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder");
  const file = request.nextUrl.searchParams.get("file");

  if (!folder || !file) {
    return NextResponse.json({ error: "Brak parametrów folder/file." }, { status: 400 });
  }

  if (folder.includes("..") || file.includes("..")) {
    return NextResponse.json({ error: "Nieprawidłowa ścieżka." }, { status: 400 });
  }

  const imagePath = path.join(process.cwd(), "app", "pictures", folder, file);
  const ext = path.extname(file).toLowerCase();
  const mimeType = MIME_BY_EXT[ext];

  if (!mimeType) {
    return NextResponse.json({ error: "Nieobsługiwany format pliku." }, { status: 400 });
  }

  try {
    const data = await fs.readFile(imagePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Nie znaleziono pliku." }, { status: 404 });
  }
}

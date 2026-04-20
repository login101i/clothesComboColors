import fs from "node:fs/promises";
import path from "node:path";
import Gallery from "@/components/Gallery";

type FolderData = {
  name: string;
  images: string[];
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const PICTURES_ROOT = path.join(process.cwd(), "app", "pictures");

async function readImageFolders(): Promise<FolderData[]> {
  const entries = await fs.readdir(PICTURES_ROOT, { withFileTypes: true });

  const folderNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "pl"));

  const result: FolderData[] = [];

  for (const folderName of folderNames) {
    const folderPath = path.join(PICTURES_ROOT, folderName);
    const fileEntries = await fs.readdir(folderPath, { withFileTypes: true });

    const images = fileEntries
      .filter((entry) => {
        if (!entry.isFile()) return false;
        const ext = path.extname(entry.name).toLowerCase();
        return IMAGE_EXTENSIONS.has(ext);
      })
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "pl"));

    result.push({ name: folderName, images });
  }

  return result.sort((a, b) => {
    if (b.images.length !== a.images.length) {
      return b.images.length - a.images.length;
    }
    return a.name.localeCompare(b.name, "pl");
  });
}

export default async function Home() {
  const folders = await readImageFolders();

  return (
    <main className="container">
      <header className="hero">
        <p className="hero-kicker">Curated Style</p>
        <h1>Maciej Combos Colors</h1>
     
      </header>
      <Gallery folders={folders} />
    </main>
  );
}

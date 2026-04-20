"use client";

import { useMemo, useState } from "react";

type FolderData = {
  name: string;
  images: string[];
};

type ActiveImage = {
  folder: string;
  file: string;
};

type GalleryProps = {
  folders: FolderData[];
};

const getImageUrl = (folder: string, file: string) =>
  `/api/image?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(file)}`;

export default function Gallery({ folders }: GalleryProps) {
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const hasImages = useMemo(
    () => folders.some((folder) => folder.images.length > 0),
    [folders]
  );

  const folderSections = useMemo(
    () =>
      folders.map((folder) => ({
        ...folder,
        sectionId: `section-${folder.name.toLocaleLowerCase("pl").replace(/\s+/g, "-")}`,
      })),
    [folders]
  );

  return (
    <>
      <div className="toc-wrapper">
        <button
          type="button"
          className="toc-button"
          onClick={() => setIsTocOpen((prev) => !prev)}
          aria-expanded={isTocOpen}
          aria-controls="folders-toc"
        >
          <span aria-hidden>≡</span> Spis
        </button>
        {isTocOpen ? (
          <div id="folders-toc" className="toc-panel">
            {folderSections.map((folder) => (
              <a
                key={folder.name}
                href={`#${folder.sectionId}`}
                className="toc-link"
                onClick={() => setIsTocOpen(false)}
              >
                <span>{folder.name.toLocaleUpperCase("pl")}</span>
                <span>{`x${folder.images.length}`}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {!hasImages ? (
        <p className="empty-message">
          Nie znaleziono zdjęć. Sprawdź, czy foldery zawierają pliki JPG/PNG/WebP.
        </p>
      ) : null}

      {folderSections.map((folder) => (
        <section key={folder.name} id={folder.sectionId} className="folder-section">
          <h2 className="section-title">
            <span>{folder.name.toLocaleUpperCase("pl")}</span>
            <span className="section-count">{`x${folder.images.length} Pictures`}</span>
          </h2>
          {folder.images.length === 0 ? (
            <p className="empty-folder">Brak zdjęć w tym folderze.</p>
          ) : (
            <div className="grid">
              {folder.images.map((file) => (
                <button
                  key={file}
                  type="button"
                  className="card"
                  onClick={() => setActiveImage({ folder: folder.name, file })}
                >
                  <img
                    src={getImageUrl(folder.name, file)}
                    alt={`${folder.name} - ${file}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
      ))}

      {activeImage ? (
        <div
          className="modal-overlay"
          onClick={() => setActiveImage(null)}
          role="presentation"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="close-button"
              onClick={() => setActiveImage(null)}
            >
              Zamknij
            </button>
            <img
              src={getImageUrl(activeImage.folder, activeImage.file)}
              alt={`${activeImage.folder} - ${activeImage.file}`}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

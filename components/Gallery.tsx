"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  `/api/image/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;

export default function Gallery({ folders }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

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

  const allImages = useMemo(
    () =>
      folderSections.flatMap((folder) =>
        folder.images.map((file) => ({ folder: folder.name, file }))
      ),
    [folderSections]
  );

  const activeImage: ActiveImage | null =
    activeIndex !== null ? allImages[activeIndex] ?? null : null;

  const openImage = (folder: string, file: string) => {
    const index = allImages.findIndex(
      (image) => image.folder === folder && image.file === file
    );
    if (index >= 0) setActiveIndex(index);
  };

  const showNextImage = () => {
    if (!allImages.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % allImages.length;
    });
  };

  const showPreviousImage = () => {
    if (!allImages.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + allImages.length) % allImages.length;
    });
  };

  useEffect(() => {
    if (activeImage === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => {
          if (prev === null || allImages.length === 0) return prev;
          return (prev + 1) % allImages.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => {
          if (prev === null || allImages.length === 0) return prev;
          return (prev - 1 + allImages.length) % allImages.length;
        });
      }
      if (event.key === "Escape") setActiveIndex(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImage, allImages.length]);

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
                  onClick={() => openImage(folder.name, file)}
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
          onClick={() => setActiveIndex(null)}
          role="presentation"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchStartX.current = e.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              const startX = touchStartX.current;
              const endX = e.changedTouches[0]?.clientX ?? null;
              if (startX === null || endX === null) return;
              const delta = endX - startX;
              if (Math.abs(delta) < 40) return;
              if (delta < 0) showNextImage();
              if (delta > 0) showPreviousImage();
            }}
          >
            <button
              type="button"
              className="close-button"
              onClick={() => setActiveIndex(null)}
            >
              Zamknij
            </button>
            <button
              type="button"
              className="nav-button nav-prev"
              onClick={showPreviousImage}
              aria-label="Poprzednie zdjęcie"
            >
              ‹
            </button>
            <button
              type="button"
              className="nav-button nav-next"
              onClick={showNextImage}
              aria-label="Następne zdjęcie"
            >
              ›
            </button>
            <img
              src={getImageUrl(activeImage.folder, activeImage.file)}
              alt={`${activeImage.folder} - ${activeImage.file}`}
            />
            <p className="modal-meta">
              {`${activeImage.folder.toLocaleUpperCase("pl")} • ${activeIndex !== null ? activeIndex + 1 : 1}/${allImages.length}`}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

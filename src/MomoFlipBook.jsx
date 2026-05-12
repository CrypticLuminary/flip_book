import HTMLFlipBook from "react-pageflip";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_PAGES = [
  "https://www.8848momos.com.au/wp-content/uploads/1.jpg",
  "https://www.8848momos.com.au/wp-content/uploads/2.jpg",
  "https://www.8848momos.com.au/wp-content/uploads/3.jpg",
  "https://www.8848momos.com.au/wp-content/uploads/4.jpg",
  "https://www.8848momos.com.au/wp-content/uploads/5.jpg",
  "https://www.8848momos.com.au/wp-content/uploads/6.jpg",
  "https://www.8848momos.com.au/wp-content/uploads/7.jpg",
  "https://www.8848momos.com.au/wp-content/uploads/8.jpg",
];

const PAGE_WIDTH = 330;
const PAGE_HEIGHT = 546;
const SPREAD_WIDTH = PAGE_WIDTH * 2;
const STAGE_GAP = 84;

const MenuPage = forwardRef(function MenuPage({ page, src }, ref) {
  return (
    <article className={`momoFlipPage ${page === 0 ? "isCover" : ""}`} ref={ref}>
      <img src={src} alt={`Menu page ${page + 1}`} draggable="false" />
    </article>
  );
});

export default function MomoFlipBook({
  pages = DEFAULT_PAGES,
  open = true,
  onClose = () => {},
}) {
  const viewerRef = useRef(null);
  const stageRef = useRef(null);
  const bookRef = useRef(null);
  const [page, setPage] = useState(0);
  const [bookShift, setBookShift] = useState("-25%");
  const [zoom, setZoom] = useState(1);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const stageSize = useElementSize(stageRef);

  const layout = useMemo(() => {
    const stageWidth = stageSize.width || SPREAD_WIDTH;
    const stageHeight = stageSize.height || PAGE_HEIGHT;
    const availableWidth = Math.max(240, stageWidth - STAGE_GAP);
    const availableHeight = Math.max(320, stageHeight);
    const scale = Math.min(1, availableWidth / SPREAD_WIDTH, availableHeight / PAGE_HEIGHT);
    const pageWidth = Math.max(210, Math.floor(PAGE_WIDTH * scale));
    const pageHeight = Math.max(348, Math.floor(PAGE_HEIGHT * scale));

    return {
      key: "landscape",
      pageWidth,
      pageHeight,
      bookWidth: pageWidth * 2,
      bookHeight: pageHeight,
    };
  }, [stageSize.height, stageSize.width]);

  const pageFlip = () => bookRef.current?.pageFlip?.();

  const setResponsiveBookShift = useCallback((nextPage) => {
    if (nextPage === 0) {
      setBookShift("-25%");
    } else if (nextPage === pages.length - 1) {
      setBookShift("25%");
    } else {
      setBookShift("0px");
    }
  }, [pages.length]);

  const flipNext = useCallback(() => {
    if (isFlipping || page >= pages.length - 1) return;
    setResponsiveBookShift(page + 1);
    pageFlip()?.flipNext("bottom");
  }, [isFlipping, page, pages.length, setResponsiveBookShift]);

  const flipPrev = useCallback(() => {
    if (isFlipping || page <= 0) return;
    setResponsiveBookShift(page - 1);
    pageFlip()?.flipPrev("bottom");
  }, [isFlipping, page, setResponsiveBookShift]);

  const goToPage = useCallback((nextPage, animated = true) => {
    const safePage = Math.max(0, Math.min(pages.length - 1, nextPage));
    setResponsiveBookShift(safePage);
    if (animated) pageFlip()?.flip(safePage, "bottom");
    else pageFlip()?.turnToPage(safePage);
    setThumbsOpen(false);
    setMoreOpen(false);
  }, [pages.length, setResponsiveBookShift]);

  useEffect(() => {
    setResponsiveBookShift(page);
    pageFlip()?.update();
  }, [layout.key, layout.pageHeight, layout.pageWidth, page, setResponsiveBookShift]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") flipNext();
      if (event.key === "ArrowLeft") flipPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipNext, flipPrev, onClose, open]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!event.target.closest(".momoMoreWrap")) setMoreOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  if (!open) return null;

  return (
    <div className="momoOverlay">
      <section className="momoViewer" ref={viewerRef} aria-label="8848 Momo House menu">
        <button className="momoClose" type="button" onClick={onClose} aria-label="Close menu">
          x
        </button>
        <div className="momoSideSlider" aria-hidden="true">
          <span />
        </div>

        <div className="momoStage" ref={stageRef}>
          {thumbsOpen && (
            <aside className="momoThumbRail" aria-label="Page thumbnails">
              {pages.map((src, index) => (
                <button
                  className={`momoThumb ${index === page ? "isActive" : ""}`}
                  type="button"
                  key={src}
                  onClick={() => goToPage(index, false)}
                >
                  <img src={src} alt="" />
                  <span>{index + 1}/{pages.length}</span>
                </button>
              ))}
            </aside>
          )}

          <button
            className="momoNav momoPrev"
            type="button"
            onClick={flipPrev}
            disabled={page === 0 || isFlipping}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </button>

          <div
            className="momoBookWrap"
            style={{
              "--zoom": zoom,
              "--book-shift": bookShift,
              "--book-width": `${layout.bookWidth}px`,
              "--book-height": `${layout.bookHeight}px`,
            }}
          >
            <HTMLFlipBook
              key={`${layout.key}-${layout.pageWidth}-${layout.pageHeight}`}
              ref={bookRef}
              width={PAGE_WIDTH}
              height={PAGE_HEIGHT}
              size="stretch"
              minWidth={210}
              maxWidth={layout.pageWidth}
              minHeight={348}
              maxHeight={layout.pageHeight}
              maxShadowOpacity={0.42}
              drawShadow
              flippingTime={950}
              usePortrait={false}
              showCover
              startPage={page}
              autoSize
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={18}
              onFlip={(event) => {
                setPage(event.data);
                setResponsiveBookShift(event.data);
              }}
              onChangeState={(event) => setIsFlipping(event.data !== "read")}
              className="momoFlipBook"
            >
              {pages.map((src, index) => (
                <MenuPage key={src} page={index} src={src} />
              ))}
            </HTMLFlipBook>
          </div>

          <button
            className="momoNav momoNext"
            type="button"
            onClick={flipNext}
            disabled={page >= pages.length - 1 || isFlipping}
            aria-label="Next page"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="momoToolbar" aria-label="Menu controls">
          <div className="momoPageLabel">{page + 1}/{pages.length}</div>

          <ToolbarButton label="Toggle Thumbnails" active={thumbsOpen} onClick={() => setThumbsOpen((value) => !value)}>
            <GridIcon />
          </ToolbarButton>

          <ToolbarButton label="Zoom In" onClick={() => setZoom((value) => Math.min(1.45, value + 0.12))}>
            <ZoomInIcon />
          </ToolbarButton>

          <ToolbarButton label="Zoom Out" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - 0.12))}>
            <ZoomOutIcon />
          </ToolbarButton>

          <ToolbarButton
            label="Toggle Fullscreen"
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen?.();
              else viewerRef.current?.requestFullscreen?.();
            }}
          >
            <FullscreenIcon />
          </ToolbarButton>

          <ToolbarButton
            label="Share"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "8848 Momo House Menu", url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
          >
            <ShareIcon />
          </ToolbarButton>

          <div className="momoMoreWrap">
            <ToolbarButton label="More" active={moreOpen} onClick={() => setMoreOpen((value) => !value)}>
              <DotsIcon />
            </ToolbarButton>

            {moreOpen && (
              <div className="momoMoreMenu">
                <button type="button" onClick={() => goToPage(0, false)}>Goto First Page</button>
                <button type="button" onClick={() => goToPage(pages.length - 1, false)}>Goto Last Page</button>
                <button type="button" onClick={() => { setZoom(1); setMoreOpen(false); }}>Reset Zoom</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .momoOverlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(13, 17, 23, 0.78);
          font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
        }

        .momoViewer {
          position: relative;
          width: min(100%, 965px);
          height: min(100%, 648px);
          min-height: min(520px, calc(100vh - 36px));
          overflow: visible;
          background: #f2f3f8;
          border-radius: 0 104px 104px 104px;
          box-shadow: 0 26px 90px rgba(0, 0, 0, 0.34);
          user-select: none;
          box-sizing: border-box;
        }

        .momoViewer::before {
          content: "";
          position: absolute;
          inset: 1.5% 11.6% 1.5% 10.2%;
          background: rgba(255, 255, 255, 0.32);
          pointer-events: none;
        }

        .momoClose {
          position: absolute;
          top: 12px;
          left: 16px;
          z-index: 20;
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #334155;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .momoSideSlider {
          position: absolute;
          top: 0;
          right: -20px;
          bottom: 0;
          z-index: 18;
          width: 14px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
        }

        .momoSideSlider::before,
        .momoSideSlider::after {
          content: "";
          position: absolute;
          left: 3px;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
        }

        .momoSideSlider::before {
          top: 5px;
          border-bottom: 6px solid #8b949e;
        }

        .momoSideSlider::after {
          bottom: 5px;
          border-top: 6px solid #8b949e;
        }

        .momoSideSlider span {
          position: absolute;
          top: 18px;
          left: 4px;
          width: 6px;
          height: 72%;
          border-radius: 999px;
          background: #8b8f96;
        }

        .momoStage {
          position: absolute;
          inset: 2.8% 6.6% 11.1%;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1800px;
        }

        .momoBookWrap {
          position: relative;
          z-index: 3;
          width: min(var(--book-width), 100%);
          height: min(var(--book-height), 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateX(var(--book-shift, 0px)) scale(var(--zoom));
          transform-origin: center;
          transition: transform 520ms cubic-bezier(.2,.72,.22,1);
        }

        .momoBookWrap::after {
          content: "";
          position: absolute;
          left: 7%;
          right: 7%;
          bottom: -18px;
          height: 24px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0,0,0,.22), rgba(0,0,0,0) 70%);
          pointer-events: none;
        }

        .momoFlipBook {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
        }

        .momoFlipBook .stf__wrapper,
        .momoFlipBook .stf__block {
          overflow: visible !important;
        }

        .momoFlipPage {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #fff;
          box-shadow: none;
        }

        .momoFlipPage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: fill;
          background: #fff;
          pointer-events: none;
        }

        .momoNav {
          position: absolute;
          top: 50%;
          z-index: 9;
          width: 46px;
          height: 74px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #fff;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,.55));
          transform: translateY(-50%);
          cursor: pointer;
        }

        .momoNav:disabled {
          opacity: 0;
          pointer-events: none;
        }

        .momoPrev {
          left: 118px;
        }

        .momoNext {
          right: 118px;
        }

        .momoToolbar {
          position: absolute;
          left: 50%;
          bottom: 20px;
          z-index: 12;
          display: flex;
          align-items: center;
          height: 42px;
          padding: 0 11px;
          gap: 8px;
          background: #fff;
          border: 1px solid #d8dde7;
          border-radius: 5px;
          box-shadow: 0 2px 9px rgba(15, 23, 42, .22);
          transform: translateX(-50%);
        }

        .momoPageLabel {
          min-width: 42px;
          color: #818997;
          font-size: 12px;
          line-height: 1;
          text-align: center;
        }

        .momoToolButton {
          display: grid;
          place-items: center;
          width: 24px;
          height: 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #6f7b89;
          cursor: pointer;
        }

        .momoToolButton:hover,
        .momoToolButton.isActive {
          color: #18243a;
        }

        .momoToolButton:disabled {
          opacity: .35;
          cursor: default;
        }

        .momoMoreWrap {
          position: relative;
        }

        .momoMoreMenu {
          position: absolute;
          right: 0;
          bottom: 37px;
          width: 160px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #d8dde7;
          border-radius: 6px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, .24);
        }

        .momoMoreMenu button {
          display: block;
          width: 100%;
          padding: 10px 12px;
          border: 0;
          background: #fff;
          color: #334155;
          text-align: left;
          cursor: pointer;
        }

        .momoMoreMenu button:hover {
          background: #f2f3f8;
        }

        .momoThumbRail {
          position: absolute;
          left: 10px;
          top: 10px;
          bottom: 10px;
          z-index: 14;
          width: 112px;
          padding: 8px;
          overflow-y: auto;
          background: rgba(255,255,255,.94);
          border: 1px solid #d8dde7;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, .18);
        }

        .momoThumb {
          width: 100%;
          margin: 0 0 8px;
          padding: 4px;
          border: 2px solid transparent;
          background: #fff;
          color: #64748b;
          cursor: pointer;
          font-size: 11px;
        }

        .momoThumb.isActive {
          border-color: #153d78;
        }

        .momoThumb img {
          display: block;
          width: 100%;
          aspect-ratio: ${PAGE_WIDTH} / ${PAGE_HEIGHT};
          object-fit: fill;
          background: #eef1f6;
        }

        @media (max-width: 760px) {
          .momoOverlay {
            padding: 14px;
          }

          .momoViewer {
            width: min(100%, 520px);
            height: min(100%, 720px);
            min-height: min(620px, calc(100vh - 28px));
            border-radius: 0 62px 62px 62px;
          }

          .momoStage {
            inset: 5.6% 8.5% 13%;
          }

          .momoPrev {
            left: 4px;
          }

          .momoNext {
            right: 4px;
          }

          .momoToolbar {
            gap: 5px;
            bottom: 3.4%;
            max-width: calc(100% - 48px);
            overflow-x: auto;
          }

          .momoSideSlider {
            right: -18px;
          }
        }

        @media (max-width: 480px) {
          .momoOverlay {
            padding: 10px;
          }

          .momoViewer {
            width: 100%;
            height: 100%;
            min-height: 0;
            border-radius: 0 42px 42px 42px;
          }

          .momoStage {
            inset: 7% 10.5% 14%;
          }

          .momoPrev {
            left: -2px;
          }

          .momoNext {
            right: -2px;
          }

          .momoNav {
            width: 38px;
            height: 62px;
          }

          .momoToolbar {
            height: 40px;
            gap: 3px;
            padding: 0 8px;
          }

          .momoPageLabel {
            min-width: 38px;
          }

          .momoToolButton {
            width: 22px;
          }
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({ active = false, children, disabled = false, label, onClick }) {
  return (
    <button
      className={`momoToolButton ${active ? "isActive" : ""}`}
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function ChevronLeft() {
  return (
    <svg width="34" height="52" viewBox="0 0 34 52" fill="none" aria-hidden="true">
      <path d="M23 8 9 26l14 18" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="34" height="52" viewBox="0 0 34 52" fill="none" aria-hidden="true">
      <path d="m11 8 14 18-14 18" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.8 15.4 7M8.6 13.2l6.8 3.8" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import Aos from 'aos';
import SectionHeading from './SectionHeading';

const FALLBACK_IMG = '/images/about-banner.webp';
const INITIAL_COUNT = 15;

/**
 * The gallery lays each photograph out at its own shape rather than cropping
 * all forty-five into the same 4:3 tile, which cut the subject out of every
 * portrait shot. Dimensions come from the data (see
 * scripts/optimize-boxing-images.mjs), so the browser reserves the right box
 * before the file arrives and nothing jumps while the page loads.
 *
 * Each photo is served as WebP at two sizes - a small one for the grid, a
 * large one for the lightbox - with the original JPEG left as the fallback.
 */
export default function BoxingGallery({ data }) {
  const { sectionHeading, photos } = data;
  const [index, setIndex] = useState(null); // index into full photos array, or null
  const [showAll, setShowAll] = useState(false);

  const isOpen = index !== null;
  const visible = showAll ? photos : photos?.slice(0, INITIAL_COUNT);
  const hiddenCount = showAll ? 0 : Math.max(0, (photos?.length ?? 0) - INITIAL_COUNT);

  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const touchStart = useRef(null);

  const open = useCallback((i, event) => {
    openerRef.current = event?.currentTarget ?? null;
    setIndex(i);
  }, []);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos]
  );

  // Keyboard controls, scroll lock, and focus handling while the lightbox is
  // open. It declared aria-modal before but left focus behind it, so a
  // keyboard or screen-reader user was tabbing through the page underneath.
  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    const opener = openerRef.current;
    dialog?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'ArrowRight') {
        next();
      } else if (e.key === 'Tab' && dialog) {
        // Keep focus inside the dialog.
        const focusable = dialog.querySelectorAll('button');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // Send focus back where it came from, not to the top of the document.
      opener?.focus?.();
    };
  }, [isOpen, close, prev, next]);

  // Fetch the neighbours while the current photo is being looked at, so
  // stepping through the gallery does not blink white between each one.
  useEffect(() => {
    if (!isOpen || !photos?.length) return;
    for (const offset of [1, -1]) {
      const neighbour = photos[(index + offset + photos.length) % photos.length];
      const image = new Image();
      image.src = neighbour.full || neighbour.src;
    }
  }, [isOpen, index, photos]);

  // Re-run AOS when more photos are revealed
  useEffect(() => {
    Aos.refresh();
  }, [showAll]);

  const onTouchStart = (e) => {
    touchStart.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    // Ignore anything that reads as a tap rather than a swipe.
    if (Math.abs(delta) < 50) return;
    if (delta < 0) next();
    else prev();
  };

  const current = isOpen ? photos[index] : null;

  return (
    <section className="section" id="boxing-gallery">
      <div className="container">
        <SectionHeading
          miniTitle={sectionHeading.miniTitle}
          title={sectionHeading.title}
        />

        {/* Even rows of identical tiles; the uncropped photograph is one
            click away in the lightbox. */}
        <div className="gallery-grid">
          {visible?.map((photo, i) => {
            /*
              The last tile of the collapsed grid carries the count of what is
              hidden and opens the rest. A plain button under the grid asked
              people to believe there was more; showing them thirty faces
              behind a "+30" does not have to ask.
            */
            const isMoreTile = hiddenCount > 0 && i === visible.length - 1;

            return (
            <button
              type="button"
              className={`gallery-item${isMoreTile ? ' is-more' : ''}`}
              key={photo.src}
              aria-label={
                isMoreTile
                  ? `Show all ${photos.length} photos`
                  : photo.caption || `Open photo ${i + 1} of ${photos.length}`
              }
              data-aos="fade-up"
              data-aos-duration="700"
              onClick={(event) => (isMoreTile ? setShowAll(true) : open(i, event))}
            >
              <picture>
                {photo.thumb && <source srcSet={photo.thumb} type="image/webp" />}
                <img
                  src={photo.src}
                  alt={photo.caption || `Boxing photo ${i + 1}`}
                  width={photo.w}
                  height={photo.h}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              </picture>
              {isMoreTile ? (
                <span className="gallery-more-overlay" aria-hidden="true">
                  <span className="gallery-more-count">+{hiddenCount}</span>
                  <span className="gallery-more-label">more photos</span>
                </span>
              ) : (
                <>
                  <span className="gallery-zoom" aria-hidden="true">
                    <Icon icon="bi:plus" />
                  </span>
                  {photo.caption && (
                    <span className="gallery-caption">{photo.caption}</span>
                  )}
                </>
              )}
            </button>
            );
          })}
        </div>

        {photos?.length > INITIAL_COUNT && (
          <div className="gallery-more">
            <button
              type="button"
              className="gallery-more-btn"
              onClick={() => setShowAll((s) => !s)}
            >
              <Icon icon={showAll ? 'bi:chevron-up' : 'bi:images'} />
              {showAll ? 'Show fewer photos' : `See all ${photos.length} photos`}
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || `Photo ${index + 1} of ${photos.length}`}
          ref={dialogRef}
          tabIndex={-1}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="lightbox-bg" onClick={close}></div>

          <button
            type="button"
            className="lightbox-close"
            aria-label="Close"
            onClick={close}
          >
            <Icon icon="bi:x-lg" />
          </button>

          <button
            type="button"
            className="lightbox-nav prev"
            aria-label="Previous photo"
            onClick={prev}
          >
            <Icon icon="bi:chevron-left" />
          </button>

          <div className="lightbox-stage">
            <picture>
              {current.full && <source srcSet={current.full} type="image/webp" />}
              <img
                src={current.src}
                alt={current.caption || `Boxing photo ${index + 1}`}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />
            </picture>
            <div className="lightbox-meta">
              {current.caption && <span>{current.caption}</span>}
              <span className="lightbox-counter">
                {index + 1} / {photos.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="lightbox-nav next"
            aria-label="Next photo"
            onClick={next}
          >
            <Icon icon="bi:chevron-right" />
          </button>
        </div>
      )}
    </section>
  );
}

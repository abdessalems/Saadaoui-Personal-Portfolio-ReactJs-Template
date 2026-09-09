import React from 'react';

/**
 * Brand mark: the SA monogram — boxer, laptop and chart in one circle.
 *
 * The mark carries the initials itself, so there is no wordmark beside it; a
 * second "SAADAOUI" next to a logo that already says SA reads as a stutter.
 * The name is still announced to screen readers through the alt text.
 *
 * The image has its dark background baked in, so it sits in a rounded tile and
 * reads as a badge in both themes rather than as a mistake on the light one.
 */
export default function Logo() {
  return (
    <span className="brand-logo">
      <span className="brand-emblem">
        <img
          src="/images/logo-sa.webp"
          alt="Saadaoui Abdessalem"
          width="64"
          height="64"
          decoding="async"
        />
      </span>
    </span>
  );
}

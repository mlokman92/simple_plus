import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only HTML shell. Runs at build time for the static export — it never ships
 * to native. Sets the pitch-friendly viewport, background, and font smoothing.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1E6FD9" />
        <meta
          name="description"
          content="Simple+ — AI-powered skincare companion. Skin. Predictive. Personalised."
        />
        <title>Simple+ — AI Skincare Companion</title>

        {/* Brand mark as an inline SVG favicon — no binary asset to keep in sync. */}
        <link rel="icon" type="image/svg+xml" href={FAVICON} />

        {/* Keeps the body from bouncing so the app owns all scrolling. */}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: RESET }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-7 -3 114 120">
<defs><linearGradient id="g" x1="0.15" y1="0" x2="0.85" y2="1">
<stop offset="0" stop-color="#2E6FD9"/><stop offset="0.52" stop-color="#2FA36B"/>
<stop offset="1" stop-color="#6CBF4B"/></linearGradient></defs>
<rect x="-7" y="-3" width="114" height="120" rx="24" fill="#EAF3FC"/>
<path d="M74 20 C52 8 28 20 30 40 C32 58 62 58 66 76 C69 92 50 104 26 96"
stroke="url(#g)" stroke-width="15" stroke-linecap="round" fill="none"/>
<path d="M70 6 C82 14 84 30 74 40 C66 30 65 16 70 6 Z" fill="url(#g)"/></svg>`;

const FAVICON = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`;

const RESET = `
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #EAF3FC;
    overscroll-behavior: none;
  }
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  * { -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 0; height: 0; }
`;

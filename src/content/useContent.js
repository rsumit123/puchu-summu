import { useEffect, useState } from 'react';
import defaults from '../data/defaultContent';

export const CONTENT_URL = 'https://puchu-summu-site.s3.ap-south-1.amazonaws.com/content.json';

// Light shape check only — the server validates strictly on save. This just
// stops a broken file from taking the page down.
export function looksValid(c) {
  return (
    !!c &&
    typeof c === 'object' &&
    Array.isArray(c.dates) &&
    Array.isArray(c.moments) &&
    Array.isArray(c.gallery) &&
    Array.isArray(c.words) &&
    typeof c.message === 'string'
  );
}

export async function fetchContent(url = CONTENT_URL) {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    const c = await r.json();
    return looksValid(c) ? c : null;
  } catch {
    return null;
  }
}

// One shared request for all the sections on the page.
let shared;
const loadOnce = () => (shared ??= fetchContent());

// Starts from the bundled defaults (no flash, no outage if S3 is unreachable)
// and swaps in the live content when it arrives.
export function useContent() {
  const [content, setContent] = useState(defaults);
  useEffect(() => {
    let live = true;
    loadOnce().then((c) => {
      if (live && c) setContent(c);
    });
    return () => {
      live = false;
    };
  }, []);
  return content;
}

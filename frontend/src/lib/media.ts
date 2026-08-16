/**
 * Travel photos are 1-3 MB originals — right for a full-screen viewer, far too
 * heavy for a grid of thumbnails. `public/travel-thumbs/` mirrors the same tree
 * at 640px wide (10.8 MB for the whole set against 259 MB of originals), so
 * previews load instantly and the original is only fetched when someone opens
 * a photo properly.
 *
 * Regenerate with the thumbnail script if new photos are added; anything with
 * no thumbnail simply falls back to its original.
 */
export function thumbnailFor(src: string): string {
    return src.startsWith("/travel/") ? src.replace("/travel/", "/travel-thumbs/") : src;
}

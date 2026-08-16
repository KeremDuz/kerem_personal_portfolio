"use client";

import { useEffect, useRef, useState } from "react";

// Inline LQIP for the landscape crop — the variant narrow screens load.
const BLUR =
    "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAACwAwCdASoUAA8APt1apkyopSOiMAgBEBuJZwAAW9yN/C5OSyM4gAD+52PmevOUMdx7FUckQHGBFN+YYk1U7yXaKsnuUtohb4koQrYgG7qbGG59ttACYLJ3IAxxZK86Q+CltB0AAAA=";

const TALL_SRCSET =
    "/profile/kerem-480.webp 480w, /profile/kerem-720.webp 720w, /profile/kerem-960.webp 960w, /profile/kerem-1280.webp 1280w, /profile/kerem-1600.webp 1600w";
const WIDE_SRCSET =
    "/profile/kerem-wide-720.webp 720w, /profile/kerem-wide-1080.webp 1080w, /profile/kerem-wide-1440.webp 1440w";

type HeroPortraitProps = {
    alt: string;
};

/**
 * Full-bleed hero photograph.
 *
 * There is no card or frame: the image occupies the right edge of the hero and
 * dissolves into the page through a soft-edge mask (`.hero-photo`), so the
 * photo's own pixels blend into the background instead of sitting on top of it.
 */
export default function HeroPortrait({ alt }: HeroPortraitProps) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // The <head> preload usually wins the race against hydration, so `onLoad`
    // never fires and the placeholder would never clear. Catch that on mount.
    useEffect(() => {
        if (imgRef.current?.complete) setLoaded(true);
    }, []);

    return (
        // Below `lg` the photo is a band across the top with the copy underneath;
        // from `lg` up it becomes the right-hand column the copy sits beside.
        <div className="hero-photo pointer-events-none absolute inset-x-0 top-0 z-0 h-[52svh] overflow-hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[58%] xl:w-[54%]">
            {/* Low-quality placeholder so the space is never empty mid-download */}
            <div
                aria-hidden="true"
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
                style={{ backgroundImage: `url("${BLUR}")`, filter: "blur(18px)", transform: "scale(1.08)" }}
            />

            {/* Art direction, not just resizing: the two layouts need genuinely
                different crops. The tall 3:4 original suits the desktop column;
                a 4:3 crop framed on his face suits the wide mobile band, where
                the portrait would otherwise show little more than sky. */}
            <picture>
                <source media="(min-width: 1024px)" srcSet={TALL_SRCSET} sizes="65vw" />
                <img
                    ref={imgRef}
                    src="/profile/kerem-wide-1080.webp"
                    srcSet={WIDE_SRCSET}
                    sizes="100vw"
                    width={1080}
                    height={810}
                    alt={alt}
                    // The photo is the LCP element — fetch it eagerly, paint it at
                    // full opacity on the first frame, and never fade it in.
                    fetchPriority="high"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    // The desktop column is scaled slightly past its frame so he
                    // reads at a confident size rather than floating small in a
                    // very tall panel.
                    className="h-full w-full object-cover object-[58%_45%] lg:origin-bottom lg:scale-[1.12] lg:object-[58%_42%]"
                />
            </picture>

            {/* Colour grade — pulls the photo's greys toward the site palette so
                the seam between image and background disappears. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-cyber-green/[0.06] via-transparent to-cyber-blue/[0.10] mix-blend-screen"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-dark-bg/25" />
        </div>
    );
}

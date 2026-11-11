"use client";

import { useEffect } from "react";

/**
 * Reliable in-page navigation for `href="#section"` links.
 *
 * The sections below the fold load media lazily (photos, the 3D globe), so
 * their heights change while a smooth scroll is in flight. A plain anchor jump
 * aims at where the target *was* and lands short — e.g. on Blog when Travel was
 * clicked. This handler scrolls, then re-aims until the target sits still.
 */
export default function AnchorScroll() {
    useEffect(() => {
        let cancelPending: (() => void) | null = null;

        const scrollToId = (id: string) => {
            const target = document.getElementById(id);
            if (!target) return false;

            cancelPending?.();
            target.scrollIntoView({ behavior: "smooth", block: "start" });

            // Re-check a few times after the scroll settles; stop once the
            // target is where it should be or the user scrolls themselves.
            let attempts = 0;
            let timer = 0;
            const stopOnUserInput = () => cancel();
            const cancel = () => {
                window.clearTimeout(timer);
                window.removeEventListener("wheel", stopOnUserInput);
                window.removeEventListener("touchstart", stopOnUserInput);
                window.removeEventListener("keydown", stopOnUserInput);
                cancelPending = null;
            };
            const settle = () => {
                const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
                const drift = target.getBoundingClientRect().top - offset;
                if (Math.abs(drift) > 4 && attempts < 6) {
                    attempts += 1;
                    window.scrollBy({ top: drift, behavior: "instant" as ScrollBehavior });
                    timer = window.setTimeout(settle, 250);
                    return;
                }
                cancel();
            };

            window.addEventListener("wheel", stopOnUserInput, { passive: true });
            window.addEventListener("touchstart", stopOnUserInput, { passive: true });
            window.addEventListener("keydown", stopOnUserInput);
            timer = window.setTimeout(settle, 900);
            cancelPending = cancel;
            return true;
        };

        const onClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
                return;
            }
            const link = (event.target as Element | null)?.closest?.("a[href^='#']");
            const id = link?.getAttribute("href")?.slice(1);
            if (!id || !scrollToId(id)) return;

            event.preventDefault();
            history.replaceState(null, "", `#${id}`);
        };

        document.addEventListener("click", onClick);

        // Arriving from another page with a hash (e.g. /tr#travel from the
        // projects page): the browser's own jump fires before lazy sections
        // settle, so aim again once the page has loaded.
        const initialId = decodeURIComponent(window.location.hash.slice(1));
        let initialTimer = 0;
        if (initialId) {
            initialTimer = window.setTimeout(() => scrollToId(initialId), 300);
        }
        return () => {
            document.removeEventListener("click", onClick);
            window.clearTimeout(initialTimer);
            cancelPending?.();
        };
    }, []);

    return null;
}

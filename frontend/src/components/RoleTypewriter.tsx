"use client";

import { memo, useEffect, useRef, useState } from "react";

const TYPE_MS = 75;
const DELETE_MS = 35;
const HOLD_MS = 1900;
const SWITCH_MS = 350;

/**
 * Typewriter for the hero role list.
 *
 * Kept in its own component on purpose: it sets state every ~40-75ms, and
 * isolating it here means the hero's headline, portrait and buttons are not
 * re-rendered dozens of times a second alongside it.
 */
function RoleTypewriter({ roles }: { roles: string[] }) {
    const [text, setText] = useState("");
    const cursor = useRef({ role: 0, char: 0, deleting: false });

    useEffect(() => {
        if (roles.length === 0) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let timer: ReturnType<typeof setTimeout>;

        if (reduced) {
            // No per-character animation — just rotate the whole phrase.
            let index = 0;
            setText(roles[0]);
            const rotate = () => {
                index = (index + 1) % roles.length;
                setText(roles[index]);
                timer = setTimeout(rotate, 3000);
            };
            timer = setTimeout(rotate, 3000);
            return () => clearTimeout(timer);
        }

        const tick = () => {
            const state = cursor.current;
            const role = roles[state.role % roles.length];
            let delay: number;

            if (state.deleting) {
                state.char -= 1;
                setText(role.slice(0, state.char));
                if (state.char <= 0) {
                    state.deleting = false;
                    state.role = (state.role + 1) % roles.length;
                    delay = SWITCH_MS;
                } else {
                    delay = DELETE_MS;
                }
            } else {
                state.char += 1;
                setText(role.slice(0, state.char));
                if (state.char >= role.length) {
                    state.deleting = true;
                    delay = HOLD_MS;
                } else {
                    delay = TYPE_MS;
                }
            }

            timer = setTimeout(tick, delay);
        };

        timer = setTimeout(tick, 500);
        return () => clearTimeout(timer);
    }, [roles]);

    return (
        <span className="font-mono text-base md:text-lg text-gray-300">
            {text}
            <span
                aria-hidden="true"
                className="inline-block w-[2px] h-[1.1em] bg-cyber-green ml-1 align-middle animate-blink"
            />
        </span>
    );
}

export default memo(RoleTypewriter);

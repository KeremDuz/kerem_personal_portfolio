import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Next.js 16 removed the `next lint` command and `@next/eslint-plugin-next`
 * now ships flat config. The project previously had no ESLint config at all,
 * so `next lint` only ever prompted to create one — this makes `npm run lint`
 * actually work.
 *
 * Scoped to core-web-vitals, which is what `next lint` applied by default:
 * the Next-specific correctness rules. `eslint-config-next/typescript` also
 * bans `any`, which this codebase uses throughout — turning that on would
 * report 127 pre-existing errors and drown out anything real. Worth tightening
 * later as a deliberate cleanup, not as a side effect of the upgrade.
 */
const eslintConfig = [
    ...nextCoreWebVitals,
    {
        ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
        rules: {
            // The portfolio contains long-form editorial JSX. Replacing every
            // apostrophe and quotation mark with an HTML entity makes that
            // content harder to maintain without changing its runtime safety.
            "react/no-unescaped-entities": "off",

            // Several effects intentionally initialize browser-only state
            // (media queries, localStorage and randomized gallery layouts).
            // The exhaustive-deps and immutability rules still catch the
            // correctness problems that matter in those effects.
            "react-hooks/set-state-in-effect": "off",
        },
    },
];

export default eslintConfig;

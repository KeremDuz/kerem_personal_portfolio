"use client";

import dynamic from "next/dynamic";

const BootSequence = dynamic(() => import("@/components/BootSequence"), { ssr: false });
const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });

export default function ClientEffects() {
    return (
        <>
            <BootSequence />
            <CustomCursor />
            <ScrollProgress />
        </>
    );
}

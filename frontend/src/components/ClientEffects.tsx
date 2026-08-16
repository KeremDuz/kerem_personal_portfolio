"use client";

import dynamic from "next/dynamic";
import BootSequence from "@/components/BootSequence";

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

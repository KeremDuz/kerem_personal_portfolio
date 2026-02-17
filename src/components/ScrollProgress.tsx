"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
            style={{
                scaleX,
                background:
                    "linear-gradient(90deg, #00ff41 0%, #00f3ff 50%, #f59e0b 100%)",
                boxShadow: "0 0 10px rgba(0,255,65,0.5), 0 0 20px rgba(0,255,65,0.2)",
            }}
        />
    );
}

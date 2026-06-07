"use client";

import { motion } from "framer-motion";

interface GlitchHeadingProps {
    text: string;
    className?: string; // Allow passing text sizes/alignments
}

export function GlitchHeading({ text, className = "" }: GlitchHeadingProps) {
    return (
        <div className={`relative inline-block ${className}`}>
            {/* Main Text */}
            <h2 className="relative z-20 font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-blue-300 to-purple-300 drop-shadow-md">
                {text}
            </h2>

            <motion.h2
                className="absolute inset-0 font-bold tracking-wide text-cyan-200/50 z-10 pointer-events-none"
                style={{ opacity: 0 }}
                animate={{
                    x: [0, -4, 2, -4, 0],
                    y: [0, 2, -1, 0],
                    opacity: [0, 0.8, 0, 0.5, 0],
                }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    times: [0, 0.2, 0.4, 0.6, 1]
                }}
            >
                {text}
            </motion.h2>

            {/* Glitch Layer 2 - Violet */}
            <motion.h2
                className="absolute inset-0 font-bold tracking-wide text-purple-300/50 z-10 pointer-events-none"
                style={{ opacity: 0 }}
                animate={{
                    x: [0, 4, -2, 4, 0],
                    y: [0, -2, 1, 0],
                    opacity: [0, 0.7, 0, 0.4, 0],
                }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 3.5,
                    times: [0, 0.2, 0.4, 0.6, 1]
                }}
            >
                {text}
            </motion.h2>
        </div >
    );
}

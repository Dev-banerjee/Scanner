"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

export default function BootAnimation() {
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        // Simulate boot sequence time
        const timer = setTimeout(() => {
            setComplete(true);
        }, 2000); // 2 seconds boot time

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {!complete && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
                >
                    {/* Background Grid/Noise */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    {/* Logo Container */}
                    <div className="relative">
                        {/* Pulsing Glow Behind Logo */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 bg-cyan-500/30 rounded-full blur-[60px]"
                        />

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            <Logo size="large" />
                        </motion.div>
                    </div>

                    {/* Progress Bar & Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 w-64 space-y-4 text-center"
                    >
                        {/* Loading Text with Glitch Effect */}
                        <h2 className="text-cyan-400 font-mono text-sm tracking-[0.2em] animate-pulse">
                            SYSTEM_INITIALIZING...
                        </h2>

                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 2, ease: "linear" }}
                                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            />
                            <motion.div
                                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "circOut" }}
                            />
                        </div>

                        <div className="flex justify-between text-[10px] text-white/30 font-mono uppercase">
                            <span>Ver 2.0</span>
                            <span>Versescan_Active</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

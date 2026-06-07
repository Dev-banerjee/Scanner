import React from "react";

export function Logo({ className = "", size = "normal" }: { className?: string; size?: "small" | "normal" | "large" }) {
    const isSmall = size === "small";
    const isLarge = size === "large";
    
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* Logo Emblem */}
            <div className="relative flex-shrink-0">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
                
                {/* Emblem SVG */}
                <svg
                    className={`relative z-10 ${isSmall ? "w-8 h-8" : isLarge ? "w-14 h-14" : "w-10 h-10"}`}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Hexagon Base */}
                    <polygon
                        points="50,5 90,28 90,72 50,95 10,72 10,28"
                        className="stroke-cyan-500/20 fill-black/60 dark:fill-white/5"
                        strokeWidth="4"
                    />
                    
                    {/* Shield Outline */}
                    <path
                        d="M25,30 L50,18 L75,30 L75,55 C75,70 50,83 50,83 C50,83 25,70 25,55 Z"
                        className="stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    
                    {/* Inner V */}
                    <path
                        d="M38,40 L50,58 L62,40"
                        className="stroke-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col justify-center">
                <span className={`font-mono font-black tracking-[0.18em] text-white ${
                    isSmall ? "text-base" : isLarge ? "text-2xl" : "text-xl"
                }`}>
                    VERSE<span className="text-cyan-400">SCAN</span>
                </span>
                <span className={`font-mono text-[8px] tracking-[0.38em] text-white/40 uppercase -mt-0.5`}>
                    Neural_Spider_v2.0
                </span>
            </div>
        </div>
    );
}

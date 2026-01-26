'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface ThreeDCardProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
}

export function ThreeDCard({ src, alt, width = 280, height = 280 }: ThreeDCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation (max 20 degrees)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -20;
        const rotateYValue = ((x - centerX) / centerX) * 20;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);

        // Glare position
        setGlarePosition({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
            opacity: 1
        });
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setGlarePosition(p => ({ ...p, opacity: 0 }));
    };

    return (
        <div
            className="perspective-1000 relative"
            style={{ width, height }}
        >
            <div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full relative transition-transform duration-100 ease-out transform-style-3d cursor-pointer"
                style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
            >
                {/* Shadow */}
                <div className="absolute inset-0 bg-black/50 blur-xl rounded-full translate-z-[-20px] scale-90" />

                {/* Main Image */}
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover pointer-events-none"
                        priority
                    />

                    {/* Glare Effect */}
                    <div
                        className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
                        style={{
                            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 80%)`,
                            opacity: glarePosition.opacity
                        }}
                    />

                    {/* Scanline overlay for that retro/tech feel */}
                    <div className="absolute inset-0 bg-[url('/images/scanlines.png')] opacity-10 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

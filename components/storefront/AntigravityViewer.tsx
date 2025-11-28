"use client";

import { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// --- 3D Model Component ---

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

// --- Main Viewer Component ---

interface AntigravityViewerProps {
    posterImage: string;
    modelUrl?: string | null;
    className?: string;
}

export function AntigravityViewer({ posterImage, modelUrl, className }: AntigravityViewerProps) {
    const [isInteracting, setIsInteracting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // If no model URL is provided, just show the image
    if (!modelUrl) {
        return (
            <div className={cn("relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-zinc-900", className)}>
                <Image
                    src={posterImage}
                    alt="Product Poster"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        );
    }

    return (
        <div className={cn("relative w-full aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-zinc-900", className)}>

            {/* 3D Canvas Layer */}
            {isInteracting && (
                <div className="absolute inset-0 z-10 animate-in fade-in duration-700">
                    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 150], fov: 50 }}>
                        <Suspense fallback={null}>
                            <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.7, blur: 2 }}>
                                <Model url={modelUrl} />
                            </Stage>
                            <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} />
                            <Environment preset="city" />
                        </Suspense>
                    </Canvas>
                </div>
            )}

            {/* Poster Layer (Fades out when interacting) */}
            <AnimatePresence>
                {!isInteracting && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-20"
                    >
                        <Image
                            src={posterImage}
                            alt="Product Poster"
                            fill
                            className="object-cover"
                            priority
                        />

                        {/* "View in 3D" Floating Badge */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                            <button
                                onClick={() => setIsInteracting(true)}
                                className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                <div className="relative">
                                    <Box className="w-5 h-5 text-white drop-shadow-md" />
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-white drop-shadow-md tracking-wide">
                                    View in 3D
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Indicator (Optional, if needed during suspense) */}
            {isInteracting && !isLoaded && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    {/* We can use onCreated in Canvas to set isLoaded to true to hide this if we want precise loading state */}
                </div>
            )}

            {/* Reset Button (Visible when 3D is active) */}
            {isInteracting && (
                <button
                    onClick={() => setIsInteracting(false)}
                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm text-gray-500 transition-colors"
                    title="Close 3D View"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}

        </div>
    );
}

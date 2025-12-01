"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Box, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThreeDViewerProps {
    modelUrl: string | null;
    posterImage: string;
}

export function ThreeDViewer({ modelUrl, posterImage }: ThreeDViewerProps) {
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasError, setHasError] = useState(false);
    const modelViewerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (isInteracting && modelUrl) {
            import("@google/model-viewer").catch((e) =>
                console.error("Error loading model-viewer", e)
            );
        }
    }, [isInteracting, modelUrl]);

    const handleInteraction = () => {
        if (!modelUrl) return;
        setIsInteracting(true);
        setIsLoading(true);
        setHasError(false);
    };

    const handleModelLoad = () => {
        setIsLoading(false);
    };

    const handleModelError = () => {
        setIsLoading(false);
        setHasError(true);
        console.error("Failed to load 3D model:", modelUrl);
    };

    return (
        <div className="relative w-full h-full min-h-[400px] bg-gray-50 rounded-lg overflow-hidden group">
            {/* Poster Image */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={posterImage}
                    alt="Product Poster"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* 3D Model Viewer */}
            <AnimatePresence>
                {isInteracting && modelUrl && !hasError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full z-10 bg-white"
                    >
                        {/* @ts-ignore - model-viewer is a custom element */}
                        <model-viewer
                            ref={modelViewerRef}
                            src={modelUrl}
                            poster={posterImage}
                            alt="A 3D model of the product"
                            auto-rotate
                            camera-controls
                            ar
                            shadow-intensity="1"
                            style={{ width: "100%", height: "100%" }}
                            onLoad={handleModelLoad}
                            onError={handleModelError}
                        >
                            {/* Custom AR Button could go here */}
                        </model-viewer>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            {hasError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                        <p className="text-red-500 font-medium mb-2">Failed to load 3D model</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsInteracting(false);
                                setHasError(false);
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                    <div className="bg-white/80 p-3 rounded-full shadow-lg backdrop-blur-md">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                </div>
            )}

            {/* "View in 3D" Trigger Button */}
            {!isInteracting && modelUrl && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <Button
                        onClick={handleInteraction}
                        className="bg-white/90 text-black hover:bg-white border border-gray-200 shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95 rounded-full px-6 py-2 flex items-center gap-2"
                    >
                        <Box className="w-4 h-4" />
                        <span className="font-medium">View in 3D</span>
                    </Button>
                </div>
            )}
        </div>
    );
}

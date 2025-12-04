"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Box, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Environment } from "@react-three/drei";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface ThreeDViewerProps {
    modelUrl: string | null;
    images: string[];
}

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

import React from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode, onError: () => void }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode, onError: () => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("3D Viewer Error:", error, errorInfo);
        this.props.onError();
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

export function ThreeDViewer({ modelUrl, images }: ThreeDViewerProps) {
    const [isInteracting, setIsInteracting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const modelViewerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (isInteracting && modelUrl) {
            // We are using @react-three/fiber now, so we might not need model-viewer import
            // But keeping it if we switch back or use it for AR
        }
    }, [isInteracting, modelUrl]);

    const handleInteraction = () => {
        if (!modelUrl) return;
        setIsInteracting(true);
        setIsLoading(true);
        setHasError(false);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    return (
        <div className="relative w-full h-full min-h-[500px] bg-gray-50 rounded-lg overflow-hidden group">

            {/* Carousel Layer (Visible when NOT interacting) */}
            <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Carousel className="w-full h-full">
                    <CarouselContent>
                        {images.map((item, index) => (
                            <CarouselItem key={index}>
                                <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
                                    <Image
                                        src={item}
                                        alt="Product Image"
                                        fill
                                        className="object-cover w-full h-full"
                                        priority={index === 0}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 z-20" />
                    <CarouselNext className="right-2 z-20" />
                </Carousel>
            </div>

            {/* 3D Model Viewer Layer */}
            <AnimatePresence>
                {isInteracting && modelUrl && !hasError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full z-10 bg-white"
                    >
                        <ErrorBoundary onError={handleError}>
                            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 150], fov: 50 }}>
                                <Suspense fallback={null}>
                                    <Stage environment="city" intensity={0.6} shadows="contact">
                                        <Model url={modelUrl} />
                                    </Stage>
                                    <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} />
                                    <Environment preset="city" />
                                </Suspense>
                            </Canvas>
                        </ErrorBoundary>
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

            {/* Close 3D Button */}
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

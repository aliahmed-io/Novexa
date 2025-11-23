"use client";

import React, { useRef } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as THREE from "three";

export function HatModel() {
    const { scene } = useGLTF("/baseball cap 3d model.glb");
    const modelRef = useRef<THREE.Group>(null);

    useGSAP(() => {
        if (modelRef.current) {
            gsap.to(modelRef.current.rotation, {
                y: Math.PI * 2,
                duration: 8,
                repeat: -1,
                ease: "none",
            });
        }
    });

    return (
        <Center>
            <group ref={modelRef} dispose={null}>
                <primitive object={scene} scale={2.5} />
            </group>
        </Center>
    );
}

useGLTF.preload("/baseball cap 3d model.glb");

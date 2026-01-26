'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, Suspense } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * 0.5;
            ref.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
}

export default function ThreeDViewer() {
    return (
        <div className="w-full h-full min-h-[300px] bg-black/20 rounded-xl overflow-hidden shadow-inner border border-gray-800 relative">
            <div className="absolute top-2 right-2 z-10 bg-black/50 px-2 py-1 rounded text-[10px] text-gray-400 font-mono">
                PREVIEW MODE
            </div>
            <Canvas>
                <ambientLight intensity={Math.PI / 2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                <Box position={[0, 0, 0]} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            </Canvas>
        </div>
    );
}

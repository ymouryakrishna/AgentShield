import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CyberParticleField({ count = 350, mode = 'normal' }) {
  const pointsRef = useRef();

  // Color mapping based on security state
  const particleColor = useMemo(() => {
    if (mode === 'adversarial') return new THREE.Color('#ff0055');
    if (mode === 'legitimate') return new THREE.Color('#10b981');
    return new THREE.Color('#818cf8');
  }, [mode]);

  // Generate randomized 3D particle positions and velocities
  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 3.5 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      sc[i] = Math.random() * 0.08 + 0.02;
    }

    return [pos, sc];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const speed = mode === 'adversarial' ? 0.35 : mode === 'legitimate' ? 0.25 : 0.12;

    pointsRef.current.rotation.y = time * speed;
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={particleColor}
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

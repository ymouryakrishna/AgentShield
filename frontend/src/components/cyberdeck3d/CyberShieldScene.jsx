import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, Ring, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import CyberParticleField from './CyberParticleField';

// 1. Central Holographic Cyber Shield Mesh
function HolographicShieldCore({ mode }) {
  const coreRef = useRef();
  const innerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const deflectorRef = useRef();

  const themeColors = useMemo(() => {
    if (mode === 'adversarial') {
      return {
        primary: '#f43f5e',
        secondary: '#ff0055',
        glow: '#fda4af',
        emissive: '#e11d48',
        emissiveIntensity: 1.8,
        speed: 2.4,
      };
    }
    if (mode === 'legitimate') {
      return {
        primary: '#10b981',
        secondary: '#06b6d4',
        glow: '#a7f3d0',
        emissive: '#059669',
        emissiveIntensity: 1.4,
        speed: 1.2,
      };
    }
    return {
      primary: '#6366f1',
      secondary: '#38bdf8',
      glow: '#c7d2fe',
      emissive: '#4f46e5',
      emissiveIntensity: 0.8,
      speed: 0.8,
    };
  }, [mode]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const s = themeColors.speed;

    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.4 * s;
      coreRef.current.rotation.x = Math.sin(time * 0.3 * s) * 0.15;
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -time * 0.6 * s;
      innerRef.current.rotation.z = Math.cos(time * 0.4 * s) * 0.2;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5 * s;
      ring1Ref.current.rotation.y = time * 0.3 * s;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.6 * s;
      ring2Ref.current.rotation.z = time * 0.4 * s;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.3 * s;
      ring3Ref.current.rotation.x = -time * 0.4 * s;
    }

    if (deflectorRef.current && mode === 'adversarial') {
      const scale = 1.3 + Math.sin(time * 12) * 0.12;
      deflectorRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Central Holographic Icosahedron Core */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={coreRef} scale={1.2}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={themeColors.primary}
            emissive={themeColors.emissive}
            emissiveIntensity={themeColors.emissiveIntensity}
            roughness={0.15}
            metalness={0.85}
            wireframe={true}
          />
        </mesh>

        {/* Inner Solid Crystal Heart */}
        <mesh ref={innerRef} scale={0.75}>
          <icosahedronGeometry args={[0.9, 1]} />
          <MeshDistortMaterial
            color={themeColors.secondary}
            emissive={themeColors.emissive}
            emissiveIntensity={themeColors.emissiveIntensity * 0.7}
            distort={mode === 'adversarial' ? 0.6 : mode === 'legitimate' ? 0.35 : 0.2}
            speed={mode === 'adversarial' ? 5 : 2}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.85}
          />
        </mesh>
      </Float>

      {/* Gyroscopic Tri-Ring Security Envelopes */}
      <group ref={ring1Ref}>
        <mesh scale={1.8}>
          <torusGeometry args={[1, 0.02, 16, 64]} />
          <meshStandardMaterial
            color={themeColors.secondary}
            emissive={themeColors.secondary}
            emissiveIntensity={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      <group ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh scale={2.2}>
          <torusGeometry args={[1, 0.018, 16, 64]} />
          <meshStandardMaterial
            color={themeColors.primary}
            emissive={themeColors.primary}
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      <group ref={ring3Ref} rotation={[-Math.PI / 3, 0, Math.PI / 6]}>
        <mesh scale={2.6}>
          <torusGeometry args={[1, 0.015, 16, 64]} />
          <meshStandardMaterial
            color={themeColors.glow}
            emissive={themeColors.glow}
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Adversarial Deflector Forcefield Bubble */}
      {mode === 'adversarial' && (
        <mesh ref={deflectorRef} scale={1.4}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial
            color="#ef4444"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* Orbiting Satellite Node: AI Buyer Agent */}
      <SatelliteNode
        radius={3.2}
        speed={0.9}
        color={mode === 'adversarial' ? '#f43f5e' : '#38bdf8'}
        label="AI BUYER"
        yOffset={0.6}
      />

      {/* Orbiting Satellite Node: Policy Firewall Gate */}
      <SatelliteNode
        radius={3.8}
        speed={-0.7}
        color={mode === 'adversarial' ? '#f59e0b' : '#6366f1'}
        label="POLICY ENGINE"
        yOffset={-0.5}
      />

      {/* Orbiting Satellite Node: Razorpay Settlement Node */}
      <SatelliteNode
        radius={4.4}
        speed={0.55}
        color="#10b981"
        label="RAZORPAY EXEC"
        yOffset={0.2}
      />
    </group>
  );
}

// 2. Orbiting Satellite Node
function SatelliteNode({ radius, speed, color, label, yOffset = 0 }) {
  const nodeRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (nodeRef.current) {
      const angle = time * speed;
      nodeRef.current.position.x = Math.cos(angle) * radius;
      nodeRef.current.position.z = Math.sin(angle) * radius;
      nodeRef.current.position.y = yOffset + Math.sin(time * 2 + radius) * 0.2;
    }
  });

  return (
    <group ref={nodeRef}>
      <mesh scale={0.16}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
        />
      </mesh>
      <pointLight color={color} intensity={0.4} distance={2.5} />
    </group>
  );
}

// 3. Main Exported CyberShieldScene Canvas Wrapper
export default function CyberShieldScene({ mode = 'normal' }) {
  return (
    <div className="w-full h-full min-h-[360px] relative rounded-[20px] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 1.2, 6.2], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        {/* Ambient & Directional Cyber Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 12, 8]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-8, -6, -5]} intensity={0.8} color="#6366f1" />
        <pointLight
          position={[0, 0, 0]}
          intensity={mode === 'adversarial' ? 2.5 : mode === 'legitimate' ? 2.0 : 1.2}
          color={mode === 'adversarial' ? '#f43f5e' : mode === 'legitimate' ? '#10b981' : '#818cf8'}
        />

        {/* 3D Core Shield */}
        <HolographicShieldCore mode={mode} />

        {/* 3D Dynamic Particle Constellation */}
        <CyberParticleField count={280} mode={mode} />

        {/* Smooth Orbit Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={mode === 'adversarial' ? 2.2 : mode === 'legitimate' ? 1.4 : 0.8}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.6}
        />
      </Canvas>
    </div>
  );
}

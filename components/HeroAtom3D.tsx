'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Float, Trail } from '@react-three/drei'
import * as THREE from 'three'

function Electron({ radius = 2, speed = 1, color = '#60A5FA', ...props }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  // Random start position
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, [])
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * speed + initialAngle
      meshRef.current.position.x = Math.cos(t) * radius
      meshRef.current.position.z = Math.sin(t) * radius
    }
  })

  return (
    <group ref={groupRef} {...props}>
      <Trail
        width={2} 
        length={4} 
        color={new THREE.Color(color)} 
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshStandardMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={10}
                toneMapped={false}
            />
            <pointLight distance={2} intensity={2} color={color} />
        </mesh>
      </Trail>
    </group>
  )
}

function Nucleus() {
    // Generate a cluster of protons and neutrons
    const particles = useMemo(() => {
        const items = []
        // Create a dense packing of spheres
        const count = 12
        for (let i = 0; i < count; i++) {
            // Use spherical coordinates for better distribution
            const phi = Math.acos(-1 + (2 * i) / count)
            const theta = Math.sqrt(count * Math.PI) * phi
            
            items.push({
                position: [
                    0.25 * Math.sin(phi) * Math.cos(theta),
                    0.25 * Math.sin(phi) * Math.sin(theta),
                    0.25 * Math.cos(phi)
                ] as [number, number, number],
                color: i % 2 === 0 ? "#FF3333" : "#3333FF", // Brighter Red protons, Brighter Blue neutrons
                type: i % 2 === 0 ? "proton" : "neutron"
            })
        }
        return items
    }, [])

    return (
        <group>
            <group>
                {particles.map((p, i) => (
                    <Sphere key={i} position={p.position} args={[0.18, 32, 32]}>
                        <meshPhysicalMaterial 
                            color={p.color} 
                            emissive={p.color}
                            emissiveIntensity={0.5}
                            roughness={0.1}
                            metalness={0.9}
                            clearcoat={1}
                            clearcoatRoughness={0.1}
                        />
                    </Sphere>
                ))}
            </group>
            
            {/* Inner Glow */}
            <pointLight distance={8} intensity={5} color="#8B5CF6" />
        </group>
    )
}

function AtomScene() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#4C1D95" />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Nucleus />
                
                {/* Random Orbits */}
                <Electron radius={2} speed={1.5} rotation={[Math.PI / 3, Math.PI / 4, 0]} color="#60A5FA" />
                <Electron radius={2.5} speed={1.2} rotation={[Math.PI / 2, 0, Math.PI / 6]} color="#C084FC" />
                <Electron radius={1.8} speed={2} rotation={[0, Math.PI / 3, Math.PI / 4]} color="#F472B6" />
                <Electron radius={2.8} speed={0.8} rotation={[Math.PI / 6, Math.PI / 2, 0]} color="#34D399" />
            </Float>
            
            <OrbitControls 
                enableZoom={false} 
                autoRotate 
                autoRotateSpeed={0.5}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
            />
        </>
    )
}

export default function HeroAtom3D() {
    return (
        <div className="w-full h-full absolute inset-0">
            <Canvas camera={{ position: [0, 0, 8.5], fov: 40 }}>
                <AtomScene />
            </Canvas>
        </div>
    )
}

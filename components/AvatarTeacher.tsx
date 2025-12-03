'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Avatar Model Component using GLB
function AvatarModel({ speaking = false }: { speaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const [morphTargetMeshes, setMorphTargetMeshes] = useState<THREE.Mesh[]>([])
  
  // Load the GLB model
  const { scene } = useGLTF('/avatar.glb')
  
  // Clone the scene to avoid modifying the cached version
  const clonedScene = scene.clone()
  
  // Find all meshes with morph targets (for lip sync)
  useEffect(() => {
    const meshes: THREE.Mesh[] = []
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        meshes.push(child)
        console.log('Found mesh with morph targets:', child.name, 'Count:', child.morphTargetInfluences.length)
        if (child.morphTargetDictionary) {
          console.log('Morph targets:', Object.keys(child.morphTargetDictionary))
        }
      }
    })
    setMorphTargetMeshes(meshes)
  }, [clonedScene])
  
  // Idle animation - gentle breathing and swaying
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Breathing effect
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.02
      
      // Gentle sway
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.08
      
      // More movement when speaking
      if (speaking) {
        groupRef.current.rotation.x = Math.sin(time * 8) * 0.05
        groupRef.current.scale.x = 1 + Math.sin(time * 10) * 0.01
      }
    }
    
    // Lip sync animation when speaking
    if (speaking && morphTargetMeshes.length > 0) {
      const time = state.clock.getElapsedTime()
      
      morphTargetMeshes.forEach((mesh) => {
        if (!mesh.morphTargetInfluences || !mesh.morphTargetDictionary) return
        
        // Try common mouth morph target names
        const mouthTargets = ['mouthOpen', 'mouth_open', 'MouthOpen', 'jawOpen', 'jaw_open', 'JawOpen', 'viseme_aa', 'viseme_O']
        
        mouthTargets.forEach((targetName) => {
          const index = mesh.morphTargetDictionary?.[targetName]
          if (index !== undefined && mesh.morphTargetInfluences) {
            // Animate mouth opening/closing while speaking
            mesh.morphTargetInfluences[index] = Math.abs(Math.sin(time * 10)) * 0.6
          }
        })
      })
    } else if (morphTargetMeshes.length > 0) {
      // Reset mouth when not speaking
      morphTargetMeshes.forEach((mesh) => {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences.fill(0)
        }
      })
    }
  })
  
  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      <primitive object={clonedScene} scale={6} />
    </group>
  )
}

// Preload the GLB model
useGLTF.preload('/avatar.glb')

// Main Avatar Component
export default function AvatarTeacher({ speaking = false }: { speaking: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.8, 2.5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#8b5cf6" />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.3} penumbra={1} />
        
        <AvatarModel speaking={speaking} />
        
        <Environment preset="city" />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

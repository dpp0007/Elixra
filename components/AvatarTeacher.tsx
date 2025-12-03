'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Avatar Model Component using GLB
function AvatarModel({ speaking = false }: { speaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const [morphTargetMeshes, setMorphTargetMeshes] = useState<THREE.Mesh[]>([])
  const [bones, setBones] = useState<{ bone: THREE.Bone | THREE.Object3D, name: string, type: string }[]>([])
  const headBoneRef = useRef<THREE.Bone | THREE.Object3D | null>(null)
  const jawBoneRef = useRef<THREE.Bone | THREE.Object3D | null>(null)
  const eyeBoneRef = useRef<THREE.Bone | THREE.Object3D | null>(null)
  
  // Load the GLB model
  const { scene } = useGLTF('/avatar.glb')
  
  // Clone the scene to avoid modifying the cached version
  const clonedScene = scene.clone()
  
  // Auto-detect bones and morph targets - targeting Wolf3D model
  useEffect(() => {
    const meshes: THREE.Mesh[] = []
    const detectedBones: { bone: THREE.Bone | THREE.Object3D, name: string, type: string }[] = []
    
    clonedScene.traverse((child) => {
      // Find morph targets
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        meshes.push(child)
        console.log('✅ Found mesh with morph targets:', child.name, 'Count:', child.morphTargetInfluences.length)
        if (child.morphTargetDictionary) {
          console.log('📋 Morph targets:', Object.keys(child.morphTargetDictionary))
        }
      }
      
      // Find specific Wolf3D meshes and bones
      const name = child.name
      
      // Head mesh
      if (name === 'Wolf3D_Head' || name.includes('Head')) {
        headBoneRef.current = child
        console.log('🎯 Found HEAD:', name)
      }
      
      // Teeth/Jaw for mouth animation
      if (name === 'Wolf3D_Teeth' || name.includes('Teeth') || name.includes('Jaw')) {
        jawBoneRef.current = child
        console.log('🎯 Found JAW/TEETH:', name)
      }
      
      // Eyes
      if (name.includes('Eye')) {
        eyeBoneRef.current = child
        console.log('🎯 Found EYES:', name)
      }
      
      // Find bones in armature
      if (child.type === 'Bone') {
        const boneName = child.name.toLowerCase()
        let type = 'body'
        
        if (boneName.includes('head')) {
          type = 'head'
          if (!headBoneRef.current) headBoneRef.current = child
        } else if (boneName.includes('jaw') || boneName.includes('chin')) {
          type = 'jaw'
          if (!jawBoneRef.current) jawBoneRef.current = child
        } else if (boneName.includes('eye')) {
          type = 'eye'
          if (!eyeBoneRef.current) eyeBoneRef.current = child
        }
        
        detectedBones.push({ bone: child, name: child.name, type })
        console.log('🦴 Found bone:', child.name, 'Type:', type)
      }
    })
    
    setMorphTargetMeshes(meshes)
    setBones(detectedBones)
    console.log(`🎭 Wolf3D Animation ready: ${meshes.length} morph targets, ${detectedBones.length} bones`)
    console.log(`🎯 Targets: Head=${!!headBoneRef.current}, Jaw=${!!jawBoneRef.current}, Eyes=${!!eyeBoneRef.current}`)
  }, [clonedScene])
  
  // Debug speaking state
  useEffect(() => {
    console.log('🎤 Speaking state changed:', speaking)
  }, [speaking])
  
  // SINGLE useFrame - all animations in one place
  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    // TEST: Very obvious tilt animation (proves useFrame works)
    groupRef.current.rotation.z = Math.sin(time) * 0.15
    
    // 1. BODY ANIMATIONS (breathing & swaying)
    groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.05
    groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
    
    // 2. SPEAKING ANIMATIONS (more movement)
    if (speaking) {
      groupRef.current.rotation.x = Math.sin(time * 8) * 0.1
      groupRef.current.scale.x = 1 + Math.sin(time * 10) * 0.03
    }
    
    // 3. HEAD BONE (nodding)
    if (headBoneRef.current) {
      if (speaking) {
        headBoneRef.current.rotation.z = Math.sin(time * 2) * 0.1
        headBoneRef.current.rotation.x = Math.sin(time * 1.5) * 0.08
      } else {
        headBoneRef.current.rotation.z = Math.sin(time * 0.5) * 0.03
      }
    }
    
    // 4. JAW BONE (lip sync)
    if (jawBoneRef.current) {
      if (speaking) {
        jawBoneRef.current.rotation.x = Math.abs(Math.sin(time * 10)) * 0.4
      } else {
        jawBoneRef.current.rotation.x = 0
      }
    }
    
    // 5. MORPH TARGETS (lip sync)
    if (speaking && morphTargetMeshes.length > 0) {
      morphTargetMeshes.forEach((mesh) => {
        if (!mesh.morphTargetInfluences || !mesh.morphTargetDictionary) return
        
        const mouthTargets = ['mouthOpen', 'mouth_open', 'MouthOpen', 'jawOpen', 'jaw_open', 'JawOpen', 'viseme_aa', 'viseme_O']
        
        mouthTargets.forEach((targetName) => {
          const index = mesh.morphTargetDictionary?.[targetName]
          if (index !== undefined && mesh.morphTargetInfluences) {
            mesh.morphTargetInfluences[index] = Math.abs(Math.sin(time * 10)) * 0.8
          }
        })
      })
    } else if (morphTargetMeshes.length > 0) {
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
          target={[0, 1.2, 0]}
          enableZoom={true}
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

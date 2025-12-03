'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
  
  // Force rendering
  const { invalidate } = useThree()
  
  // Log when component mounts
  useEffect(() => {
    console.log('🎭 AvatarModel mounted, groupRef:', !!groupRef.current)
    console.log('🎭 Scene children:', clonedScene.children.length)
    invalidate() // Force a render
  }, [clonedScene, invalidate])
  

  
  // Use requestAnimationFrame instead of useFrame (Next.js compatible)
  // Store speaking state in a ref to avoid re-renders
  const speakingRef = useRef(speaking)
  useEffect(() => {
    speakingRef.current = speaking
  }, [speaking])
  
  useEffect(() => {
    console.log('🎬 Starting requestAnimationFrame animation loop')
    let frameId: number
    let frameCount = 0
    
    const animate = () => {
      if (!groupRef.current) {
        frameId = requestAnimationFrame(animate)
        return
      }
      
      const time = Date.now() * 0.001
      const isSpeaking = speakingRef.current
      
      // Log every 60 frames
      if (frameCount % 60 === 0) {
        console.log('🎬 RAF frame #' + frameCount, 'speaking:', isSpeaking)
      }
      frameCount++
      
      // BODY ANIMATIONS (always active)
      groupRef.current.rotation.z = Math.sin(time) * 0.15
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.05
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
      
      if (isSpeaking) {
        groupRef.current.rotation.x = Math.sin(time * 8) * 0.1
        groupRef.current.scale.x = 1 + Math.sin(time * 10) * 0.03
      } else {
        groupRef.current.rotation.x = 0
        groupRef.current.scale.x = 1
      }
      
      // HEAD BONE
      if (headBoneRef.current) {
        if (isSpeaking) {
          headBoneRef.current.rotation.z = Math.sin(time * 2) * 0.1
          headBoneRef.current.rotation.x = Math.sin(time * 1.5) * 0.08
        } else {
          headBoneRef.current.rotation.z = Math.sin(time * 0.5) * 0.03
          headBoneRef.current.rotation.x = 0
        }
      }
      
      // JAW BONE
      if (jawBoneRef.current) {
        if (isSpeaking) {
          jawBoneRef.current.rotation.x = Math.abs(Math.sin(time * 10)) * 0.4
        } else {
          jawBoneRef.current.rotation.x = 0
        }
      }
      
      // MORPH TARGETS (lip sync)
      morphTargetMeshes.forEach((mesh) => {
        if (!mesh.morphTargetInfluences || !mesh.morphTargetDictionary) return
        
        if (isSpeaking) {
          const jawIndex = mesh.morphTargetDictionary['jawOpen']
          if (jawIndex !== undefined) {
            mesh.morphTargetInfluences[jawIndex] = Math.abs(Math.sin(time * 10)) * 0.8
          }
        } else {
          // Reset all morph targets when not speaking
          mesh.morphTargetInfluences.fill(0)
        }
      })
      
      invalidate() // Tell Three.js to re-render
      frameId = requestAnimationFrame(animate)
    }
    
    frameId = requestAnimationFrame(animate)
    
    return () => {
      console.log('🛑 Stopping RAF animation loop')
      cancelAnimationFrame(frameId)
    }
  }, []) // Empty deps - only run once!
  
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
  useEffect(() => {
    console.log('🎬 AvatarTeacher mounted, speaking:', speaking)
  }, [])
  
  useEffect(() => {
    console.log('🎤 Speaking prop changed:', speaking)
  }, [speaking])
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.8, 2.5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        frameloop="always"
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
      
      {/* Debug overlay */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-2 rounded">
        Speaking: {speaking ? 'YES' : 'NO'}
      </div>
    </div>
  )
}

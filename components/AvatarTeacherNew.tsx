'use client'

import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Avatar Model using proper gltfjsx structure
function AvatarModel({ speaking = false }: { speaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const { nodes, materials } = useGLTF('/avatar.glb') as any
  
  // Refs for morph target meshes
  const eyeLeftRef = useRef<THREE.SkinnedMesh>(null)
  const eyeRightRef = useRef<THREE.SkinnedMesh>(null)
  const headRef = useRef<THREE.SkinnedMesh>(null)
  const teethRef = useRef<THREE.SkinnedMesh>(null)
  
  // Speaking state ref
  const speakingRef = useRef(speaking)
  useEffect(() => {
    speakingRef.current = speaking
    console.log('🎤 Speaking changed:', speaking)
  }, [speaking])
  
  // Animation loop
  useEffect(() => {
    console.log('🎬 Starting animation loop')
    let frameId: number
    let frameCount = 0
    
    const animate = () => {
      const time = Date.now() * 0.001
      const isSpeaking = speakingRef.current
      
      // Log every 60 frames
      if (frameCount % 60 === 0) {
        console.log('🎬 Frame #' + frameCount, 'speaking:', isSpeaking)
      }
      frameCount++
      
      // BODY ANIMATIONS
      if (groupRef.current) {
        groupRef.current.rotation.z = Math.sin(time) * 0.1
        groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.03
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.08
        
        if (isSpeaking) {
          groupRef.current.rotation.x = Math.sin(time * 8) * 0.08
        } else {
          groupRef.current.rotation.x = 0
        }
      }
      
      // LIP SYNC - Animate jawOpen morph target
      if (isSpeaking) {
        const jawValue = Math.abs(Math.sin(time * 10)) * 0.7
        
        if (headRef.current?.morphTargetInfluences && headRef.current.morphTargetDictionary) {
          const jawIndex = headRef.current.morphTargetDictionary['jawOpen']
          if (jawIndex !== undefined) {
            headRef.current.morphTargetInfluences[jawIndex] = jawValue
          }
        }
        
        if (teethRef.current?.morphTargetInfluences && teethRef.current.morphTargetDictionary) {
          const jawIndex = teethRef.current.morphTargetDictionary['jawOpen']
          if (jawIndex !== undefined) {
            teethRef.current.morphTargetInfluences[jawIndex] = jawValue
          }
        }
      } else {
        // Reset morph targets
        if (headRef.current?.morphTargetInfluences) {
          headRef.current.morphTargetInfluences.fill(0)
        }
        if (teethRef.current?.morphTargetInfluences) {
          teethRef.current.morphTargetInfluences.fill(0)
        }
      }
      
      // EYE BLINKING (random)
      if (Math.random() < 0.01) {
        if (eyeLeftRef.current?.morphTargetInfluences && eyeLeftRef.current.morphTargetDictionary) {
          const blinkIndex = eyeLeftRef.current.morphTargetDictionary['eyeBlinkLeft']
          if (blinkIndex !== undefined) {
            eyeLeftRef.current.morphTargetInfluences[blinkIndex] = 1
            setTimeout(() => {
              if (eyeLeftRef.current?.morphTargetInfluences) {
                eyeLeftRef.current.morphTargetInfluences[blinkIndex] = 0
              }
            }, 100)
          }
        }
        
        if (eyeRightRef.current?.morphTargetInfluences && eyeRightRef.current.morphTargetDictionary) {
          const blinkIndex = eyeRightRef.current.morphTargetDictionary['eyeBlinkRight']
          if (blinkIndex !== undefined) {
            eyeRightRef.current.morphTargetInfluences[blinkIndex] = 1
            setTimeout(() => {
              if (eyeRightRef.current?.morphTargetInfluences) {
                eyeRightRef.current.morphTargetInfluences[blinkIndex] = 0
              }
            }, 100)
          }
        }
      }
      
      frameId = requestAnimationFrame(animate)
    }
    
    frameId = requestAnimationFrame(animate)
    
    return () => {
      console.log('🛑 Stopping animation')
      cancelAnimationFrame(frameId)
    }
  }, [])
  
  return (
    <group ref={groupRef} {...{ dispose: null }} position={[0, 0.5, 0]} scale={[1.8, 10, 1.8]}>
      <primitive object={nodes.Hips} />
      
      <skinnedMesh
        ref={eyeLeftRef}
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      
      <skinnedMesh
        ref={eyeRightRef}
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      
      <skinnedMesh
        ref={headRef}
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      
      <skinnedMesh
        ref={teethRef}
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  )
}

useGLTF.preload('/avatar.glb')

// Main Avatar Component
export default function AvatarTeacherNew({ speaking = false }: { speaking: boolean }) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 1.5, 2.5], fov: 40 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        frameloop="always"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#8b5cf6" />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.3} penumbra={1} />
        
        <AvatarModel speaking={speaking} />
        
        <Environment preset="city" />
        <OrbitControls
          target={[0, 1.8, 0]}
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={4}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* Debug overlay */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-2 rounded">
        Speaking: {speaking ? 'YES ✅' : 'NO'}
      </div>
    </div>
  )
}

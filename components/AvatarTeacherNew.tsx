'use client'

import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Avatar Model using proper gltfjsx structure
function AvatarModel({ 
  speaking = false, 
  lipSyncIntensity = 0,
  currentPhoneme = 'neutral',
  currentEmotion = 'neutral'
}: { 
  speaking: boolean, 
  lipSyncIntensity?: number,
  currentPhoneme?: string,
  currentEmotion?: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const { nodes, materials } = useGLTF('/avatar.glb') as any
  
  // Refs for morph target meshes
  const eyeLeftRef = useRef<THREE.SkinnedMesh>(null)
  const eyeRightRef = useRef<THREE.SkinnedMesh>(null)
  const headRef = useRef<THREE.SkinnedMesh>(null)
  const teethRef = useRef<THREE.SkinnedMesh>(null)
  
  // Speaking state, lip sync intensity, phoneme, and emotion refs
  const speakingRef = useRef(speaking)
  const lipSyncIntensityRef = useRef(lipSyncIntensity)
  const currentPhonemeRef = useRef(currentPhoneme)
  const currentEmotionRef = useRef(currentEmotion)
  
  useEffect(() => {
    speakingRef.current = speaking
    console.log('🎤 Speaking changed:', speaking)
  }, [speaking])
  
  useEffect(() => {
    lipSyncIntensityRef.current = lipSyncIntensity
  }, [lipSyncIntensity])
  
  useEffect(() => {
    currentEmotionRef.current = currentEmotion
    console.log('😊 Emotion changed:', currentEmotion)
  }, [currentEmotion])
  
  useEffect(() => {
    currentPhonemeRef.current = currentPhoneme
  }, [currentPhoneme])
  
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
      
      // BODY ANIMATIONS - Always active
      if (groupRef.current) {
        // Extremely subtle breathing (always active)
        groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.003
        
        // Head rotation - ALWAYS ACTIVE (both idle and speaking)
        if (isSpeaking) {
          // More pronounced rotation when speaking
         groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02
          groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.015
        } else {
          // Subtle rotation when idle
          groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.02
          groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.015
        }
      }
      
      // SHOULDER/ARM ROTATION - Always active
      if (nodes.LeftArm && nodes.RightArm) {
        if (isSpeaking) {
          // More expressive arm gestures when speaking
          nodes.LeftArm.rotation.z = Math.sin(time * 4) * 0.2
          nodes.RightArm.rotation.z = -Math.sin(time * 4) * 0.2
        } else {
          // Subtle breathing-like shoulder movement when idle
          nodes.LeftArm.rotation.z = Math.sin(time * 4) * 0.2
          nodes.RightArm.rotation.z = -Math.sin(time * 4) * 0.2
           nodes.LeftArm.rotation.y = 0.2
          nodes.RightArm.rotation.y = -0.2
          nodes.LeftArm.rotation.x = 1.2
          nodes.RightArm.rotation.x = 1.2
        }
      }
      
      // ULTRA-REALISTIC LIP SYNC - High sensitivity with phoneme-based teeth animation
      if (isSpeaking) {
        const currentIntensity = lipSyncIntensityRef.current
        const phoneme = currentPhonemeRef.current
        let jawValue = 0
        let teethVisibility = 0  // How much teeth show (0-1)
        
        // Use intensity from speech events with enhanced sensitivity
        if (currentIntensity > 0) {
          // Increased multiplier for more visible mouth movement
          jawValue = currentIntensity * 0.65
          
          // PHONEME-BASED TEETH ANIMATION
          // Different sounds show teeth differently
          switch(phoneme) {
            case 'F': case 'V': // F, V sounds - upper teeth on lower lip
              teethVisibility = 0.8
              jawValue *= 0.4  // Less jaw opening
              break
            case 'TH': // TH sounds - tongue between teeth
              teethVisibility = 0.9
              jawValue *= 0.5
              break
            case 'S': case 'Z': // S, Z sounds - teeth close together
              teethVisibility = 0.7
              jawValue *= 0.3
              break
            case 'T': case 'D': case 'N': // T, D, N - tongue on teeth
              teethVisibility = 0.6
              jawValue *= 0.5
              break
            case 'EE': case 'I': // EE, I sounds - wide smile, teeth visible
              teethVisibility = 0.8
              jawValue *= 0.6
              break
            case 'A': case 'AH': // A, AH sounds - wide open, less teeth
              teethVisibility = 0.3
              jawValue *= 1.0  // Full opening
              break
            case 'O': case 'OO': // O, OO sounds - rounded, no teeth
              teethVisibility = 0.1
              jawValue *= 0.7
              break
            case 'M': case 'B': case 'P': // M, B, P - lips closed
              teethVisibility = 0.0
              jawValue *= 0.2
              break
            default: // Neutral/consonants
              teethVisibility = 0.4
              break
          }
          
          // Add subtle variation for more natural look
          const microVariation = Math.sin(time * 15) * 0.02
          jawValue = Math.max(0, Math.min(1, jawValue + microVariation))
        }
        // If currentIntensity is 0, jawValue stays 0 (mouth closed)
        
        // Apply to head mesh with VERY fast response
        if (headRef.current?.morphTargetInfluences && headRef.current.morphTargetDictionary) {
          const jawIndex = headRef.current.morphTargetDictionary['jawOpen']
          if (jawIndex !== undefined) {
            // Ultra-fast interpolation for instant response (0.7 = 70% immediate)
            const currentValue = headRef.current.morphTargetInfluences[jawIndex] || 0
            headRef.current.morphTargetInfluences[jawIndex] = currentValue + (jawValue - currentValue) * 0.7
          }
          
          // Apply mouth smile for teeth-showing phonemes
          const mouthSmileIndex = headRef.current.morphTargetDictionary['mouthSmile']
          if (mouthSmileIndex !== undefined && teethVisibility > 0.5) {
            const smileValue = (teethVisibility - 0.5) * 0.4  // Subtle smile
            const currentSmile = headRef.current.morphTargetInfluences[mouthSmileIndex] || 0
            headRef.current.morphTargetInfluences[mouthSmileIndex] = currentSmile + (smileValue - currentSmile) * 0.6
          }
        }
        
        // Apply to teeth mesh with phoneme-aware animation
        if (teethRef.current?.morphTargetInfluences && teethRef.current.morphTargetDictionary) {
          const jawIndex = teethRef.current.morphTargetDictionary['jawOpen']
          if (jawIndex !== undefined) {
            // Teeth follow jaw but with phoneme-based adjustment
            const teethJawValue = jawValue * (0.5 + teethVisibility * 0.5)
            const currentValue = teethRef.current.morphTargetInfluences[jawIndex] || 0
            teethRef.current.morphTargetInfluences[jawIndex] = currentValue + (teethJawValue - currentValue) * 0.7
          }
        }
      } else {
        // Very fast close when not speaking - snap shut
        if (headRef.current?.morphTargetInfluences && headRef.current.morphTargetDictionary) {
          const jawIndex = headRef.current.morphTargetDictionary['jawOpen']
          if (jawIndex !== undefined) {
            const currentValue = headRef.current.morphTargetInfluences[jawIndex] || 0
            headRef.current.morphTargetInfluences[jawIndex] = currentValue * 0.3  // Very fast close (was 0.5)
          }
        }
        
        if (teethRef.current?.morphTargetInfluences && teethRef.current.morphTargetDictionary) {
          const jawIndex = teethRef.current.morphTargetDictionary['jawOpen']
          if (jawIndex !== undefined) {
            const currentValue = teethRef.current.morphTargetInfluences[jawIndex] || 0
            teethRef.current.morphTargetInfluences[jawIndex] = currentValue * 0.3  // Very fast close (was 0.5)
          }
        }
      }
      
      // FACIAL EXPRESSIONS - Emotion-based expressions
      const emotion = currentEmotionRef.current
      if (headRef.current?.morphTargetInfluences && headRef.current.morphTargetDictionary) {
        // Get morph target indices
        const smileIndex = headRef.current.morphTargetDictionary['mouthSmile']
        const frownIndex = headRef.current.morphTargetDictionary['mouthFrown']
        const browDownIndex = headRef.current.morphTargetDictionary['browDownLeft'] || headRef.current.morphTargetDictionary['browDown']
        const browUpIndex = headRef.current.morphTargetDictionary['browInnerUp']
        const eyeWideIndex = headRef.current.morphTargetDictionary['eyeWideLeft']
        const eyeSquintIndex = headRef.current.morphTargetDictionary['eyeSquintLeft']
        
        // Reset all expressions first (smooth transition)
        const resetSpeed = 0.1
        if (smileIndex !== undefined) {
          const current = headRef.current.morphTargetInfluences[smileIndex] || 0
          headRef.current.morphTargetInfluences[smileIndex] = current * (1 - resetSpeed)
        }
        if (frownIndex !== undefined) {
          const current = headRef.current.morphTargetInfluences[frownIndex] || 0
          headRef.current.morphTargetInfluences[frownIndex] = current * (1 - resetSpeed)
        }
        
        // Apply emotion-specific expressions
        switch(emotion) {
          case 'happy':
          case 'excited':
            // Big smile + raised eyebrows
            if (smileIndex !== undefined) {
              const targetSmile = emotion === 'excited' ? 0.8 : 0.6
              const current = headRef.current.morphTargetInfluences[smileIndex] || 0
              headRef.current.morphTargetInfluences[smileIndex] = current + (targetSmile - current) * 0.15
            }
            if (browUpIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[browUpIndex] || 0
              headRef.current.morphTargetInfluences[browUpIndex] = current + (0.4 - current) * 0.15
            }
            if (eyeWideIndex !== undefined && emotion === 'excited') {
              const current = headRef.current.morphTargetInfluences[eyeWideIndex] || 0
              headRef.current.morphTargetInfluences[eyeWideIndex] = current + (0.3 - current) * 0.15
            }
            break
            
          case 'curious':
          case 'interested':
            // Slight smile + one eyebrow raised
            if (smileIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[smileIndex] || 0
              headRef.current.morphTargetInfluences[smileIndex] = current + (0.3 - current) * 0.15
            }
            if (browUpIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[browUpIndex] || 0
              headRef.current.morphTargetInfluences[browUpIndex] = current + (0.5 - current) * 0.15
            }
            break
            
          case 'concerned':
          case 'serious':
            // Slight frown + furrowed brows
            if (frownIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[frownIndex] || 0
              headRef.current.morphTargetInfluences[frownIndex] = current + (0.3 - current) * 0.15
            }
            if (browDownIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[browDownIndex] || 0
              headRef.current.morphTargetInfluences[browDownIndex] = current + (0.4 - current) * 0.15
            }
            break
            
          case 'surprised':
            // Wide eyes + raised eyebrows + open mouth
            if (eyeWideIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[eyeWideIndex] || 0
              headRef.current.morphTargetInfluences[eyeWideIndex] = current + (0.7 - current) * 0.2
            }
            if (browUpIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[browUpIndex] || 0
              headRef.current.morphTargetInfluences[browUpIndex] = current + (0.8 - current) * 0.2
            }
            break
            
          case 'thinking':
            // Squinted eyes + slight frown
            if (eyeSquintIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[eyeSquintIndex] || 0
              headRef.current.morphTargetInfluences[eyeSquintIndex] = current + (0.3 - current) * 0.15
            }
            if (browDownIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[browDownIndex] || 0
              headRef.current.morphTargetInfluences[browDownIndex] = current + (0.2 - current) * 0.15
            }
            break
            
          case 'neutral':
          default:
            // Gentle, friendly neutral expression
            if (smileIndex !== undefined) {
              const current = headRef.current.morphTargetInfluences[smileIndex] || 0
              headRef.current.morphTargetInfluences[smileIndex] = current + (0.15 - current) * 0.1
            }
            break
        }
      }
      
      // EYE BLINKING - Natural random blinks every 3-5 seconds
      const blinkChance = 0.01 // ~2-3 seconds between blinks at 60fps
      if (Math.random() < blinkChance) {
        console.log('👁️ Blinking!')
        
        // Blink using Wolf3D_Head mesh (has all morph targets)
        if (headRef.current?.morphTargetInfluences && headRef.current.morphTargetDictionary) {
          const blinkLeftIndex = headRef.current.morphTargetDictionary['eyeBlinkLeft']
          const blinkRightIndex = headRef.current.morphTargetDictionary['eyeBlinkRight']
          
          if (blinkLeftIndex !== undefined) {
            headRef.current.morphTargetInfluences[blinkLeftIndex] = 1
            setTimeout(() => {
              if (headRef.current?.morphTargetInfluences) {
                headRef.current.morphTargetInfluences[blinkLeftIndex] = 0
              }
            }, 150)
          }
          
          if (blinkRightIndex !== undefined) {
            headRef.current.morphTargetInfluences[blinkRightIndex] = 1
            setTimeout(() => {
              if (headRef.current?.morphTargetInfluences) {
                headRef.current.morphTargetInfluences[blinkRightIndex] = 0
              }
            }, 150)
          }
        }
        
        // Also try on eye meshes
        if (eyeLeftRef.current?.morphTargetInfluences && eyeLeftRef.current.morphTargetDictionary) {
          const blinkIndex = eyeLeftRef.current.morphTargetDictionary['eyeBlinkLeft']
          if (blinkIndex !== undefined) {
            eyeLeftRef.current.morphTargetInfluences[blinkIndex] = 1
            setTimeout(() => {
              if (eyeLeftRef.current?.morphTargetInfluences) {
                eyeLeftRef.current.morphTargetInfluences[blinkIndex] = 0
              }
            }, 150)
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
            }, 150)
          }
        }
      }
      
      // EYE MOVEMENT - Subtle eye tracking (looking around naturally)
      if (!isSpeaking) {
        // When idle, eyes look around slowly
        const eyeLookX = Math.sin(time * 0.3) * 0.15
        const eyeLookY = Math.cos(time * 0.2) * 0.1
        
        if (eyeLeftRef.current?.morphTargetInfluences && eyeLeftRef.current.morphTargetDictionary) {
          const lookLeftIndex = eyeLeftRef.current.morphTargetDictionary['eyeLookOutLeft']
          const lookRightIndex = eyeLeftRef.current.morphTargetDictionary['eyeLookInLeft']
          const lookUpIndex = eyeLeftRef.current.morphTargetDictionary['eyeLookUpLeft']
          const lookDownIndex = eyeLeftRef.current.morphTargetDictionary['eyeLookDownLeft']
          
          if (lookLeftIndex !== undefined && lookRightIndex !== undefined) {
            eyeLeftRef.current.morphTargetInfluences[lookLeftIndex] = Math.max(0, -eyeLookX)
            eyeLeftRef.current.morphTargetInfluences[lookRightIndex] = Math.max(0, eyeLookX)
          }
          if (lookUpIndex !== undefined && lookDownIndex !== undefined) {
            eyeLeftRef.current.morphTargetInfluences[lookUpIndex] = Math.max(0, eyeLookY)
            eyeLeftRef.current.morphTargetInfluences[lookDownIndex] = Math.max(0, -eyeLookY)
          }
        }
        
        if (eyeRightRef.current?.morphTargetInfluences && eyeRightRef.current.morphTargetDictionary) {
          const lookLeftIndex = eyeRightRef.current.morphTargetDictionary['eyeLookInRight']
          const lookRightIndex = eyeRightRef.current.morphTargetDictionary['eyeLookOutRight']
          const lookUpIndex = eyeRightRef.current.morphTargetDictionary['eyeLookUpRight']
          const lookDownIndex = eyeRightRef.current.morphTargetDictionary['eyeLookDownRight']
          
          if (lookLeftIndex !== undefined && lookRightIndex !== undefined) {
            eyeRightRef.current.morphTargetInfluences[lookLeftIndex] = Math.max(0, -eyeLookX)
            eyeRightRef.current.morphTargetInfluences[lookRightIndex] = Math.max(0, eyeLookX)
          }
          if (lookUpIndex !== undefined && lookDownIndex !== undefined) {
            eyeRightRef.current.morphTargetInfluences[lookUpIndex] = Math.max(0, eyeLookY)
            eyeRightRef.current.morphTargetInfluences[lookDownIndex] = Math.max(0, -eyeLookY)
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
    <group ref={groupRef} {...{ dispose: null }} position={[0, 0.5, 0]} scale={[1.2, 10, 1.2]}>
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

// Main Avatar Component with lip sync intensity and emotion control
export default function AvatarTeacherNew({ 
  speaking = false, 
  lipSyncIntensity = 0,
  currentPhoneme = 'neutral',
  currentEmotion = 'neutral'
}: { 
  speaking: boolean, 
  lipSyncIntensity?: number,
  currentPhoneme?: string,
  currentEmotion?: string
}) {
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
        
        <AvatarModel speaking={speaking} lipSyncIntensity={lipSyncIntensity} currentPhoneme={currentPhoneme} currentEmotion={currentEmotion} />
        
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
        Speaking: {speaking ? 'YES ✅' : 'NO'} | Intensity: {(lipSyncIntensity * 100).toFixed(0)}%
      </div>
    </div>
  )
}

'use client'

import React, { useRef, useEffect, useState, useMemo, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Outlines, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Atom, Bond } from '@/types/molecule'
import { InstancedMeshManager, PerformanceMonitor } from '@/lib/spatialHash'

interface InstancedAtomMeshProps {
  atoms: Atom[]
  onSelect: (atomId: string) => void
  selectedAtomId: string | null
  performanceMonitor: PerformanceMonitor
}

function SelectedAtomHighlight({ atom }: { atom: Atom | null }) {
  if (!atom) return null
  return (
    <mesh position={[atom.x, atom.y, atom.z]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Outlines thickness={0.05} color="#ffff00" />
    </mesh>
  )
}

function ElementInstancedMesh({ 
  atoms, 
  onSelect, 
  quality 
}: { 
  atoms: Atom[]
  onSelect: (id: string) => void
  quality: string 
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  useLayoutEffect(() => {
    if (!meshRef.current) return
    const tempObject = new THREE.Object3D()
    
    atoms.forEach((atom, i) => {
      tempObject.position.set(atom.x, atom.y, atom.z)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [atoms])

  const geometry = useMemo(() => new THREE.SphereGeometry(
    quality === 'low' ? 0.3 : quality === 'medium' ? 0.4 : 0.5,
    quality === 'low' ? 8 : quality === 'medium' ? 16 : 32,
    quality === 'low' ? 6 : quality === 'medium' ? 12 : 16
  ), [quality])

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, atoms.length]}
      onClick={(e) => {
        e.stopPropagation()
        const instanceId = e.instanceId
        if (instanceId !== undefined && atoms[instanceId]) {
          onSelect(atoms[instanceId].id)
        }
      }}
    >
      <meshStandardMaterial
        color={atoms[0]?.color || '#ffffff'}
        metalness={quality === 'low' ? 0.1 : 0.3}
        roughness={quality === 'low' ? 0.8 : 0.4}
      />
    </instancedMesh>
  )
}

function InstancedAtomMesh({ atoms, onSelect, selectedAtomId, performanceMonitor }: InstancedAtomMeshProps) {
  const [quality, setQuality] = useState('high')
  
  // Monitor performance and adjust quality
  useEffect(() => {
    const unsubscribe = performanceMonitor.onFPSChange((fps, qualityLevel) => {
      setQuality(qualityLevel)
    })
    return unsubscribe
  }, [performanceMonitor])

  // Group atoms by element for efficient instancing
  const atomsByElement = useMemo(() => {
    const groups = new Map<string, Atom[]>()
    atoms.forEach(atom => {
      if (!groups.has(atom.element)) {
        groups.set(atom.element, [])
      }
      groups.get(atom.element)!.push(atom)
    })
    return groups
  }, [atoms])

  return (
    <>
      {Array.from(atomsByElement.entries()).map(([element, elementAtoms]) => (
        <ElementInstancedMesh
          key={element}
          atoms={elementAtoms}
          onSelect={onSelect}
          quality={quality}
        />
      ))}
      
      {/* Atom Labels */}
      {atoms.map((atom) => (
        <Text
          key={`label-${atom.id}`}
          position={[atom.x, atom.y, atom.z]}
          fontSize={0.25}
          color={getContrastingColor(atom.color || '#ffffff')}
          anchorX="center"
          anchorY="middle"
          renderOrder={1}
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {atom.element}
        </Text>
      ))}
    </>
  )
}

function getContrastingColor(hex: string) {
  // Simple contrast check
  const r = parseInt(hex.substr(1, 2), 16)
  const g = parseInt(hex.substr(3, 2), 16)
  const b = parseInt(hex.substr(5, 2), 16)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return yiq >= 128 ? 'black' : 'white'
}

interface OptimizedBondMeshProps {
  bonds: Bond[]
  atoms: Atom[]
  onSelect: (bondId: string) => void
  selectedBondId: string | null
  performanceMonitor: PerformanceMonitor
}

function OptimizedBondMesh({ bonds, atoms, onSelect, selectedBondId, performanceMonitor }: OptimizedBondMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [quality, setQuality] = useState('high')
  
  useEffect(() => {
    const unsubscribe = performanceMonitor.onFPSChange((fps, qualityLevel) => {
      setQuality(qualityLevel)
    })
    return unsubscribe
  }, [performanceMonitor])

  const bondMeshes = useMemo(() => {
    return bonds.flatMap(bond => {
      const fromAtom = atoms.find(a => a.id === bond.from)
      const toAtom = atoms.find(a => a.id === bond.to)
      
      if (!fromAtom || !toAtom) return []
      
      const start = new THREE.Vector3(fromAtom.x, fromAtom.y, fromAtom.z)
      const end = new THREE.Vector3(toAtom.x, toAtom.y, toAtom.z)
      const direction = end.clone().sub(start).normalize()
      
      // Create gap at both ends - Reduced to 0 for solid connection
      const gapSize = 0.0
      const adjustedStart = start.clone().add(direction.clone().multiplyScalar(gapSize))
      const adjustedEnd = end.clone().sub(direction.clone().multiplyScalar(gapSize))
      
      const mid = adjustedStart.clone().add(adjustedEnd).multiplyScalar(0.5)
      const distance = adjustedStart.distanceTo(adjustedEnd)
      
      // Calculate rotation
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
      
      const getBondColor = () => {
        if (bond.id === selectedBondId) return '#ffff00'
        if (bond.type === 'double') return '#ff6b6b'
        if (bond.type === 'triple') return '#4ecdc4'
        if (bond.type === 'ionic') return '#ffa500'
        if (bond.type === 'hydrogen') return '#87ceeb'
        if (bond.type === 'dative') return '#a855f7' // Purple for coordinate
        return '#888888'
      }
      
      const getBondThickness = () => {
        if (bond.type === 'triple') return quality === 'low' ? 0.08 : 0.12
        if (bond.type === 'double') return quality === 'low' ? 0.06 : 0.1
        if (bond.type === 'hydrogen') return quality === 'low' ? 0.03 : 0.05
        return quality === 'low' ? 0.05 : 0.08
      }
      
      const getBondOpacity = () => {
        if (bond.type === 'hydrogen') return 0.5
        return 1
      }
      
      const segments = quality === 'low' ? 4 : quality === 'medium' ? 8 : 16
      const radius = getBondThickness()
      const color = getBondColor()
      const opacity = getBondOpacity()
      
      const meshes = []
      
      if (bond.type === 'dative') {
         // Single Arrow bond (Start -> End)
         const coneHeight = 0.6 // Slightly larger head
         const cylinderLen = Math.max(0.1, distance - coneHeight)
         const cylinderPos = start.clone().add(direction.clone().multiplyScalar(cylinderLen / 2))
         const conePos = start.clone().add(direction.clone().multiplyScalar(cylinderLen + coneHeight/2))
         
         // Cylinder
         meshes.push({
           bond, mid: cylinderPos, quaternion, distance: cylinderLen, color, radius, opacity, segments, keySuffix: '-cyl'
         })
         
         // Cone (Arrow Head)
         meshes.push({
           bond, mid: conePos, quaternion, distance: coneHeight, color, radius, opacity, segments, keySuffix: '-cone', isCone: true
         })
      } else if (bond.type === 'ionic') {
         // Double Arrow bond (<->)
         const coneHeight = 0.5
         const cylinderLen = Math.max(0.1, distance - (coneHeight * 2))
         
         // Center cylinder
         meshes.push({
           bond, mid: mid, quaternion, distance: cylinderLen, color, radius, opacity, segments, keySuffix: '-cyl'
         })
         
         // End Cone (pointing to End)
         const endConePos = end.clone().sub(direction.clone().multiplyScalar(coneHeight/2))
         meshes.push({
           bond, mid: endConePos, quaternion, distance: coneHeight, color, radius, opacity, segments, keySuffix: '-cone-end', isCone: true
         })

         // Start Cone (pointing to Start)
         const startConePos = start.clone().add(direction.clone().multiplyScalar(coneHeight/2))
         // Calculate reverse rotation
         const reverseQuaternion = new THREE.Quaternion()
         reverseQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().negate())
         
         meshes.push({
           bond, mid: startConePos, quaternion: reverseQuaternion, distance: coneHeight, color, radius, opacity, segments, keySuffix: '-cone-start', isCone: true
         })
      } else if (bond.type === 'hydrogen' || bond.type === 'aromatic') {
         // Dotted/Dashed bond
         const segmentCount = Math.max(3, Math.floor(distance * 3)) // 3 segments per unit
         const segmentLen = distance / segmentCount
         const drawLen = segmentLen * 0.6 // 60% filled, 40% gap
         
         for(let i=0; i<segmentCount; i++) {
            const centerDist = (i + 0.5) * segmentLen
            const pos = start.clone().add(direction.clone().multiplyScalar(centerDist))
            
            meshes.push({
               bond, mid: pos, quaternion, distance: drawLen, color, radius, opacity, segments, keySuffix: `-seg-${i}`
            })
         }
      } else if (bond.type === 'double') {
        const offset = 0.2
        // Robust perpendicular vector calculation
        let perp = new THREE.Vector3(0, 1, 0).cross(direction)
        if (perp.lengthSq() < 0.001) {
           perp = new THREE.Vector3(1, 0, 0).cross(direction)
        }
        perp.normalize().multiplyScalar(offset)
        
        meshes.push({
           bond, mid: mid.clone().add(perp), quaternion, distance, color, radius, opacity, segments, keySuffix: '-1'
        })
        meshes.push({
           bond, mid: mid.clone().sub(perp), quaternion, distance, color, radius, opacity, segments, keySuffix: '-2'
        })
      } else if (bond.type === 'triple') {
        const offset = 0.25
        let perp = new THREE.Vector3(0, 1, 0).cross(direction)
        if (perp.lengthSq() < 0.001) {
           perp = new THREE.Vector3(1, 0, 0).cross(direction)
        }
        perp.normalize().multiplyScalar(offset)
        
        meshes.push({
           bond, mid: mid.clone().add(perp), quaternion, distance, color, radius, opacity, segments, keySuffix: '-1'
        })
        meshes.push({
           bond, mid: mid, quaternion, distance, color, radius, opacity, segments, keySuffix: '-2'
        })
        meshes.push({
           bond, mid: mid.clone().sub(perp), quaternion, distance, color, radius, opacity, segments, keySuffix: '-3'
        })
      } else {
        meshes.push({
           bond, mid, quaternion, distance, color, radius, opacity, segments, keySuffix: ''
        })
      }
      
      return meshes
    })
  }, [bonds, atoms, selectedBondId, quality])

  return (
    <group ref={groupRef}>
      {bondMeshes.map((meshData, index) => {
        if (!meshData) return null
        
        // @ts-ignore
        const { bond, mid, quaternion, distance, color, radius, opacity, segments, keySuffix, isCone } = meshData
        
        return (
          <group key={`${bond.id}${keySuffix || ''}`}>
            <mesh
              position={mid}
              quaternion={quaternion}
              onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
            >
              {isCone ? (
                <cylinderGeometry args={[0, radius * 3, distance, segments]} />
              ) : (
                <cylinderGeometry args={[radius, radius, distance, segments]} />
              )}
              <meshStandardMaterial 
                color={color} 
                metalness={0.5} 
                roughness={0.5}
                transparent={opacity < 1}
                opacity={opacity}
              />
            </mesh>
            
            {/* Bond Type Label - Only for the main cylinder/segment to avoid duplicates */}
            {(!keySuffix || keySuffix === '-cyl' || keySuffix === '-1' || keySuffix === '-seg-1') && !isCone && (
              <Text
                position={mid.clone().add(new THREE.Vector3(0, radius + 0.15, 0))}
                quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0))} // Always face up roughly, or use billboard
                fontSize={0.15}
                color="white"
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.02}
                outlineColor="black"
                renderOrder={2}
              >
                {bond.type}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

interface EnhancedMolecule3DViewerProps {
  atoms: Atom[]
  bonds: Bond[]
  onSelectAtom: (atomId: string) => void
  onSelectBond: (bondId: string) => void
  selectedAtomId: string | null
  selectedBondId: string | null
  onCanvasClick: () => void
  controlsRef?: React.MutableRefObject<any>
  enablePerformanceOptimizations?: boolean
}

function SceneContent({
  atoms,
  bonds,
  onSelectAtom,
  onSelectBond,
  selectedAtomId,
  selectedBondId,
  onCanvasClick,
  controlsRef,
  enablePerformanceOptimizations = true
}: EnhancedMolecule3DViewerProps) {
  const performanceMonitor = useMemo(() => {
    const monitor = new PerformanceMonitor()
    monitor.start()
    return monitor
  }, [])

  useEffect(() => {
    return () => {
      performanceMonitor.stop()
    }
  }, [performanceMonitor])

  // Auto-center view when atoms are loaded or cleared
  const prevAtomCount = useRef(0)
  
  useEffect(() => {
    const currentCount = atoms.length
    const prevCount = prevAtomCount.current
    
    // Center view if:
    // 1. We went from 0 atoms to some atoms (initial load or template load)
    // 2. We have exactly 1 atom (first atom added)
    if ((prevCount === 0 && currentCount > 0) || currentCount === 1) {
      if (controlsRef?.current) {
        // Calculate centroid
        const centroid = atoms.reduce((acc, atom) => ({
          x: acc.x + atom.x,
          y: acc.y + atom.y,
          z: acc.z + atom.z
        }), { x: 0, y: 0, z: 0 })
        
        if (currentCount > 0) {
          centroid.x /= currentCount
          centroid.y /= currentCount
          centroid.z /= currentCount
        }
        
        controlsRef.current.target.set(centroid.x, centroid.y, centroid.z)
        controlsRef.current.update()
      }
    }
    
    prevAtomCount.current = currentCount
  }, [atoms, controlsRef])

  const selectedAtom = useMemo(() => 
    atoms.find(a => a.id === selectedAtomId) || null
  , [atoms, selectedAtomId])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <OrbitControls ref={controlsRef} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight position={[-10, -10, -10]} intensity={0.3} />

      <group onClick={onCanvasClick}>
        <SelectedAtomHighlight atom={selectedAtom} />
        {enablePerformanceOptimizations ? (
          <>
            <OptimizedBondMesh
              bonds={bonds}
              atoms={atoms}
              onSelect={onSelectBond}
              selectedBondId={selectedBondId}
              performanceMonitor={performanceMonitor}
            />
            <InstancedAtomMesh
              atoms={atoms}
              onSelect={onSelectAtom}
              selectedAtomId={selectedAtomId}
              performanceMonitor={performanceMonitor}
            />
          </>
        ) : (
          <>
            {/* Fallback to regular rendering */}
            {bonds.map(bond => {
              const fromAtom = atoms.find(a => a.id === bond.from)
              const toAtom = atoms.find(a => a.id === bond.to)
              
              if (!fromAtom || !toAtom) return null
              
              const start = new THREE.Vector3(fromAtom.x, fromAtom.y, fromAtom.z)
              const end = new THREE.Vector3(toAtom.x, toAtom.y, toAtom.z)
              const direction = end.clone().sub(start).normalize()
              
              const gapSize = 0.0
              const adjustedStart = start.clone().add(direction.clone().multiplyScalar(gapSize))
              const adjustedEnd = end.clone().sub(direction.clone().multiplyScalar(gapSize))
              
              const mid = adjustedStart.clone().add(adjustedEnd).multiplyScalar(0.5)
              const distance = adjustedStart.distanceTo(adjustedEnd)
              
              const quaternion = new THREE.Quaternion()
              quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

              const getBondColor = () => {
                 if (bond.id === selectedBondId) return '#ffff00'
                 if (bond.type === 'double') return '#ff6b6b'
                 if (bond.type === 'triple') return '#4ecdc4'
                 if (bond.type === 'ionic') return '#ffa500'
                 if (bond.type === 'hydrogen') return '#87ceeb'
                 if (bond.type === 'dative') return '#a855f7'
                 return '#888888'
              }

              const color = getBondColor()

              if (bond.type === 'dative') {
                 // Single Arrow bond (Start -> End)
                 const coneHeight = 0.6
                 const cylinderLen = Math.max(0.1, distance - coneHeight)
                 const cylinderPos = start.clone().add(direction.clone().multiplyScalar(cylinderLen / 2))
                 const conePos = start.clone().add(direction.clone().multiplyScalar(cylinderLen + coneHeight/2))
                 
                 return (
                    <group key={bond.id}>
                       <mesh position={cylinderPos} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                          <cylinderGeometry args={[0.08, 0.08, cylinderLen, 16]} />
                          <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                       </mesh>
                       <mesh position={conePos} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                          <cylinderGeometry args={[0, 0.24, coneHeight, 16]} />
                          <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                       </mesh>
                    </group>
                 )
              }

              if (bond.type === 'ionic') {
                 // Double Arrow bond (<->)
                 const coneHeight = 0.5
                 const cylinderLen = Math.max(0.1, distance - (coneHeight * 2))
                 const endConePos = end.clone().sub(direction.clone().multiplyScalar(coneHeight/2))
                 const startConePos = start.clone().add(direction.clone().multiplyScalar(coneHeight/2))
                 
                 const reverseQuaternion = new THREE.Quaternion()
                 reverseQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().negate())

                 return (
                    <group key={bond.id}>
                       <mesh position={mid} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                          <cylinderGeometry args={[0.08, 0.08, cylinderLen, 16]} />
                          <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                       </mesh>
                       <mesh position={endConePos} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                          <cylinderGeometry args={[0, 0.24, coneHeight, 16]} />
                          <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                       </mesh>
                       <mesh position={startConePos} quaternion={reverseQuaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                          <cylinderGeometry args={[0, 0.24, coneHeight, 16]} />
                          <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                       </mesh>
                    </group>
                 )
              }

              if (bond.type === 'hydrogen' || bond.type === 'aromatic') {
                 const segmentCount = Math.max(3, Math.floor(distance * 3))
                 const segmentLen = distance / segmentCount
                 const drawLen = segmentLen * 0.6
                 
                 return (
                    <group key={bond.id}>
                       {Array.from({length: segmentCount}).map((_, i) => {
                          const centerDist = (i + 0.5) * segmentLen
                          const pos = start.clone().add(direction.clone().multiplyScalar(centerDist))
                          return (
                             <mesh key={i} position={pos} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                                <cylinderGeometry args={[0.05, 0.05, drawLen, 8]} />
                                <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} opacity={0.5} transparent />
                             </mesh>
                          )
                       })}
                    </group>
                 )
              }

              if (bond.type === 'double') {
                 const offset = 0.2
                 let perp = new THREE.Vector3(0, 1, 0).cross(direction)
                 if (perp.lengthSq() < 0.001) perp = new THREE.Vector3(1, 0, 0).cross(direction)
                 perp.normalize().multiplyScalar(offset)
                 
                 return (
                   <group key={bond.id}>
                     <mesh position={mid.clone().add(perp)} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                        <cylinderGeometry args={[0.08, 0.08, distance, 16]} />
                        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                     </mesh>
                     <mesh position={mid.clone().sub(perp)} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                        <cylinderGeometry args={[0.08, 0.08, distance, 16]} />
                        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                     </mesh>
                   </group>
                 )
              }
              
              if (bond.type === 'triple') {
                 const offset = 0.25
                 let perp = new THREE.Vector3(0, 1, 0).cross(direction)
                 if (perp.lengthSq() < 0.001) perp = new THREE.Vector3(1, 0, 0).cross(direction)
                 perp.normalize().multiplyScalar(offset)
                 
                 return (
                   <group key={bond.id}>
                     <mesh position={mid.clone().add(perp)} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                        <cylinderGeometry args={[0.08, 0.08, distance, 16]} />
                        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                     </mesh>
                     <mesh position={mid} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                        <cylinderGeometry args={[0.08, 0.08, distance, 16]} />
                        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                     </mesh>
                     <mesh position={mid.clone().sub(perp)} quaternion={quaternion} onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}>
                        <cylinderGeometry args={[0.08, 0.08, distance, 16]} />
                        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                     </mesh>
                   </group>
                 )
              }

              return (
                <mesh
                  key={bond.id}
                  position={mid}
                  quaternion={quaternion}
                  onClick={(e) => { e.stopPropagation(); onSelectBond(bond.id) }}
                >
                  <cylinderGeometry args={[0.08, 0.08, distance, 16]} />
                  <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
                </mesh>
              )
            })}
            
            {atoms.map(atom => (
              <mesh
                key={atom.id}
                position={[atom.x, atom.y, atom.z]}
                onClick={(e) => { e.stopPropagation(); onSelectAtom(atom.id) }}
              >
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                  color={atom.color}
                  emissive={selectedAtomId === atom.id ? atom.color : '#000000'}
                  emissiveIntensity={selectedAtomId === atom.id ? 0.5 : 0}
                  metalness={0.3}
                  roughness={0.4}
                />
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.25}
                  color={getContrastingColor(atom.color || '#ffffff')}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={1}
                  outlineWidth={0.02}
                  outlineColor="#000000"
                >
                  {atom.element}
                </Text>
              </mesh>
            ))}
          </>
        )}
      </group>
    </>
  )
}

export default function EnhancedMolecule3DViewer({
  atoms,
  bonds,
  onSelectAtom,
  onSelectBond,
  selectedAtomId,
  selectedBondId,
  onCanvasClick,
  controlsRef,
  enablePerformanceOptimizations = true
}: EnhancedMolecule3DViewerProps) {
  return (
    <div 
      className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-white/10"
    >
      <Canvas style={{ pointerEvents: 'auto' }}>
        <SceneContent
          atoms={atoms}
          bonds={bonds}
          onSelectAtom={onSelectAtom}
          onSelectBond={onSelectBond}
          selectedAtomId={selectedAtomId}
          selectedBondId={selectedBondId}
          onCanvasClick={onCanvasClick}
          controlsRef={controlsRef}
          enablePerformanceOptimizations={enablePerformanceOptimizations}
        />
      </Canvas>
    </div>
  )
}
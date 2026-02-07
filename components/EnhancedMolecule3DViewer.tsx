'use client'

import React, { useRef, useEffect, useState, useMemo, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Outlines } from '@react-three/drei'
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
    </>
  )
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
      
      if (bond.type === 'double') {
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
        
        const { bond, mid, quaternion, distance, color, radius, opacity, segments, keySuffix } = meshData
        
        return (
          <mesh
            key={`${bond.id}${keySuffix || ''}`}
            position={mid}
            quaternion={quaternion}
            onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
          >
            <cylinderGeometry args={[radius, radius, distance, segments]} />
            <meshStandardMaterial 
              color={color} 
              metalness={0.5} 
              roughness={0.5}
              transparent={opacity < 1}
              opacity={opacity}
            />
          </mesh>
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

  // Auto-center view when first atom is added
  useEffect(() => {
    if (atoms.length === 1 && controlsRef?.current) {
      const atom = atoms[0]
      controlsRef.current.target.set(atom.x, atom.y, atom.z)
      controlsRef.current.update()
    }
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
                 return '#888888'
              }

              const color = getBondColor()

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
              </mesh>
            ))}
          </>
        )}
      </group>
      
      {/* Performance Stats Display */}
      <mesh position={[-7, 4, 0]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial transparent opacity={0.7} color="#000000" />
      </mesh>
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
      style={{ pointerEvents: 'none' }}
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
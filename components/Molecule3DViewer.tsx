'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Atom, Bond } from '@/types/molecule'

interface AtomMeshProps {
  atom: Atom
  onSelect: (atomId: string) => void
  isSelected: boolean
}

function AtomMesh({ atom, onSelect, isSelected }: AtomMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001
      meshRef.current.rotation.y += 0.002
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[atom.x, atom.y, atom.z]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(atom.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (meshRef.current) {
          meshRef.current.scale.set(1.2, 1.2, 1.2)
        }
      }}
      onPointerOut={() => {
        if (meshRef.current) {
          meshRef.current.scale.set(1, 1, 1)
        }
      }}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={atom.color}
        emissive={isSelected ? atom.color : '#000000'}
        emissiveIntensity={isSelected ? 0.5 : 0}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

interface BondMeshProps {
  bond: Bond
  atoms: Atom[]
  onSelect: (bondId: string) => void
  isSelected: boolean
}

function BondMesh({ bond, atoms, onSelect, isSelected }: BondMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const fromAtom = atoms.find(a => a.id === bond.from)
  const toAtom = atoms.find(a => a.id === bond.to)

  if (!fromAtom || !toAtom) return null

  const start = new THREE.Vector3(fromAtom.x, fromAtom.y, fromAtom.z)
  const end = new THREE.Vector3(toAtom.x, toAtom.y, toAtom.z)
  const direction = end.clone().sub(start).normalize()
  
  // Create gap at both ends (0.5 units from each atom)
  const gapSize = 0.5
  const adjustedStart = start.clone().add(direction.clone().multiplyScalar(gapSize))
  const adjustedEnd = end.clone().sub(direction.clone().multiplyScalar(gapSize))
  
  const mid = adjustedStart.clone().add(adjustedEnd).multiplyScalar(0.5)
  const distance = adjustedStart.distanceTo(adjustedEnd)
  
  // Calculate rotation to point from start to end
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

  const getBondColor = () => {
    if (isSelected) return '#ffff00'
    if (bond.type === 'double') return '#ff6b6b'
    if (bond.type === 'triple') return '#4ecdc4'
    if (bond.type === 'ionic') return '#ffa500'
    if (bond.type === 'hydrogen') return '#87ceeb'
    return '#888888'
  }

  const getBondThickness = () => {
    if (bond.type === 'triple') return 0.12
    if (bond.type === 'double') return 0.1
    if (bond.type === 'hydrogen') return 0.05
    return 0.08
  }

  const getBondOpacity = () => {
    if (bond.type === 'hydrogen') return 0.5
    return 1
  }

  const renderBonds = () => {
    const bondThickness = getBondThickness()
    const bondColor = getBondColor()

    if (bond.type === 'single') {
      return (
        <mesh 
          position={mid} 
          quaternion={quaternion}
          onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
        >
          <cylinderGeometry args={[bondThickness, bondThickness, distance, 6]} />
          <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.5} />
        </mesh>
      )
    }

    if (bond.type === 'double') {
      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(0.2)
      return (
        <>
          <mesh 
            position={mid.clone().add(perpendicular)} 
            quaternion={quaternion}
            onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
          >
            <cylinderGeometry args={[bondThickness, bondThickness, distance, 6]} />
            <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh 
            position={mid.clone().sub(perpendicular)} 
            quaternion={quaternion}
            onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
          >
            <cylinderGeometry args={[bondThickness, bondThickness, distance, 6]} />
            <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.5} />
          </mesh>
        </>
      )
    }

    if (bond.type === 'triple') {
      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(0.25)
      return (
        <>
          <mesh 
            position={mid.clone().add(perpendicular)} 
            quaternion={quaternion}
            onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
          >
            <cylinderGeometry args={[bondThickness, bondThickness, distance, 6]} />
            <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh 
            position={mid} 
            quaternion={quaternion}
            onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
          >
            <cylinderGeometry args={[bondThickness, bondThickness, distance, 6]} />
            <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh 
            position={mid.clone().sub(perpendicular)} 
            quaternion={quaternion}
            onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
          >
            <cylinderGeometry args={[bondThickness, bondThickness, distance, 6]} />
            <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.5} />
          </mesh>
        </>
      )
    }

    if (bond.type === 'ionic' || bond.type === 'hydrogen') {
      const opacity = getBondOpacity()
      return (
        <mesh 
          position={mid} 
          quaternion={quaternion}
          onClick={(e) => { e.stopPropagation(); onSelect(bond.id) }}
        >
          <cylinderGeometry args={[bondThickness, bondThickness, distance, 6]} />
          <meshStandardMaterial 
            color={bondColor} 
            metalness={0.5} 
            roughness={0.5}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      )
    }
  }

  return <group ref={groupRef}>{renderBonds()}</group>
}

interface Molecule3DViewerProps {
  atoms: Atom[]
  bonds: Bond[]
  onSelectAtom: (atomId: string) => void
  onSelectBond: (bondId: string) => void
  selectedAtomId: string | null
  selectedBondId: string | null
  onCanvasClick: () => void
  controlsRef?: React.MutableRefObject<any>
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
}: Molecule3DViewerProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <OrbitControls ref={controlsRef} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight position={[-10, -10, -10]} intensity={0.3} />

      <group onClick={onCanvasClick}>
        {bonds.map(bond => (
          <BondMesh
            key={bond.id}
            bond={bond}
            atoms={atoms}
            onSelect={onSelectBond}
            isSelected={selectedBondId === bond.id}
          />
        ))}

        {atoms.map(atom => (
          <AtomMesh
            key={atom.id}
            atom={atom}
            onSelect={onSelectAtom}
            isSelected={selectedAtomId === atom.id}
          />
        ))}
      </group>
    </>
  )
}

export default function Molecule3DViewer({
  atoms,
  bonds,
  onSelectAtom,
  onSelectBond,
  selectedAtomId,
  selectedBondId,
  onCanvasClick,
  controlsRef,
}: Molecule3DViewerProps) {
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
        />
      </Canvas>
    </div>
  )
}

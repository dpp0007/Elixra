import { Atom } from '@/types/molecule'

export interface SpatialHashCell {
  key: string
  atoms: Atom[]
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    minZ: number
    maxZ: number
  }
}

export class SpatialHash {
  private cellSize: number
  private cells: Map<string, SpatialHashCell>
  private bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }

  constructor(cellSize: number = 2.0) {
    this.cellSize = cellSize
    this.cells = new Map()
    this.bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 }
  }

  private getCellKey(x: number, y: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize)
    const cellY = Math.floor(y / this.cellSize)
    const cellZ = Math.floor(z / this.cellSize)
    return `${cellX},${cellY},${cellZ}`
  }

  private getCellBounds(key: string): SpatialHashCell['bounds'] {
    const [cellX, cellY, cellZ] = key.split(',').map(Number)
    return {
      minX: cellX * this.cellSize,
      maxX: (cellX + 1) * this.cellSize,
      minY: cellY * this.cellSize,
      maxY: (cellY + 1) * this.cellSize,
      minZ: cellZ * this.cellSize,
      maxZ: (cellZ + 1) * this.cellSize
    }
  }

  insert(atom: Atom): void {
    const key = this.getCellKey(atom.x, atom.y, atom.z)
    
    if (!this.cells.has(key)) {
      this.cells.set(key, {
        key,
        atoms: [],
        bounds: this.getCellBounds(key)
      })
    }
    
    this.cells.get(key)!.atoms.push(atom)
    
    // Update bounds
    this.bounds.minX = Math.min(this.bounds.minX, atom.x)
    this.bounds.maxX = Math.max(this.bounds.maxX, atom.x)
    this.bounds.minY = Math.min(this.bounds.minY, atom.y)
    this.bounds.maxY = Math.max(this.bounds.maxY, atom.y)
    this.bounds.minZ = Math.min(this.bounds.minZ, atom.z)
    this.bounds.maxZ = Math.max(this.bounds.maxZ, atom.z)
  }

  remove(atom: Atom): void {
    const key = this.getCellKey(atom.x, atom.y, atom.z)
    const cell = this.cells.get(key)
    
    if (cell) {
      const index = cell.atoms.findIndex(a => a.id === atom.id)
      if (index !== -1) {
        cell.atoms.splice(index, 1)
        
        // Remove empty cells
        if (cell.atoms.length === 0) {
          this.cells.delete(key)
        }
      }
    }
  }

  queryRadius(centerX: number, centerY: number, centerZ: number, radius: number): Atom[] {
    const nearbyAtoms: Atom[] = []
    const radiusSquared = radius * radius
    
    // Calculate the range of cells to check
    const minCellX = Math.floor((centerX - radius) / this.cellSize)
    const maxCellX = Math.floor((centerX + radius) / this.cellSize)
    const minCellY = Math.floor((centerY - radius) / this.cellSize)
    const maxCellY = Math.floor((centerY + radius) / this.cellSize)
    const minCellZ = Math.floor((centerZ - radius) / this.cellSize)
    const maxCellZ = Math.floor((centerZ + radius) / this.cellSize)
    
    // Check each cell in the range
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ++) {
          const key = `${cellX},${cellY},${cellZ}`
          const cell = this.cells.get(key)
          
          if (cell) {
            for (const atom of cell.atoms) {
              const dx = atom.x - centerX
              const dy = atom.y - centerY
              const dz = atom.z - centerZ
              const distanceSquared = dx * dx + dy * dy + dz * dz
              
              if (distanceSquared <= radiusSquared) {
                nearbyAtoms.push(atom)
              }
            }
          }
        }
      }
    }
    
    return nearbyAtoms
  }

  queryBox(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): Atom[] {
    const atomsInBox: Atom[] = []
    
    const minCellX = Math.floor(minX / this.cellSize)
    const maxCellX = Math.floor(maxX / this.cellSize)
    const minCellY = Math.floor(minY / this.cellSize)
    const maxCellY = Math.floor(maxY / this.cellSize)
    const minCellZ = Math.floor(minZ / this.cellSize)
    const maxCellZ = Math.floor(maxZ / this.cellSize)
    
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ++) {
          const key = `${cellX},${cellY},${cellZ}`
          const cell = this.cells.get(key)
          
          if (cell) {
            for (const atom of cell.atoms) {
              if (atom.x >= minX && atom.x <= maxX &&
                  atom.y >= minY && atom.y <= maxY &&
                  atom.z >= minZ && atom.z <= maxZ) {
                atomsInBox.push(atom)
              }
            }
          }
        }
      }
    }
    
    return atomsInBox
  }

  clear(): void {
    this.cells.clear()
    this.bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 }
  }

  getStats(): { totalAtoms: number; totalCells: number; avgAtomsPerCell: number } {
    let totalAtoms = 0
    this.cells.forEach(cell => {
      totalAtoms += cell.atoms.length
    })
    
    return {
      totalAtoms,
      totalCells: this.cells.size,
      avgAtomsPerCell: this.cells.size > 0 ? totalAtoms / this.cells.size : 0
    }
  }

  // Optimized bond calculation using spatial hashing
  findNearbyPairs(maxDistance: number): { atom1: Atom; atom2: Atom; distance: number }[] {
    const pairs: { atom1: Atom; atom2: Atom; distance: number }[] = []
    const processedPairs = new Set<string>()
    const maxDistanceSquared = maxDistance * maxDistance
    
    this.cells.forEach(cell => {
      for (const atom1 of cell.atoms) {
        // Check nearby cells for potential bonds
        const nearbyAtoms = this.queryRadius(atom1.x, atom1.y, atom1.z, maxDistance)
        
        for (const atom2 of nearbyAtoms) {
          if (atom1.id >= atom2.id) continue // Avoid duplicate pairs
          
          const pairKey = `${atom1.id}-${atom2.id}`
          if (processedPairs.has(pairKey)) continue
          processedPairs.add(pairKey)
          
          const dx = atom1.x - atom2.x
          const dy = atom1.y - atom2.y
          const dz = atom1.z - atom2.z
          const distanceSquared = dx * dx + dy * dy + dz * dz
          
          if (distanceSquared <= maxDistanceSquared) {
            pairs.push({
              atom1,
              atom2,
              distance: Math.sqrt(distanceSquared)
            })
          }
        }
      }
    })
    
    return pairs
  }
}

// Web Worker for heavy bond calculations
export class BondCalculationWorker {
  private worker: Worker | null = null
  private pendingCalculations = new Map<string, { resolve: (result: any) => void; reject: (error: any) => void }>()

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('/workers/bondCalculator.js')
      this.worker.onmessage = (event) => {
        const { id, result, error } = event.data
        const calculation = this.pendingCalculations.get(id)
        if (calculation) {
          if (error) {
            calculation.reject(new Error(error))
          } else {
            calculation.resolve(result)
          }
          this.pendingCalculations.delete(id)
        }
      }
    }
  }

  calculateBonds(atoms: Atom[], maxDistance: number = 2.0): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread
        const spatialHash = new SpatialHash()
        atoms.forEach(atom => spatialHash.insert(atom))
        const pairs = spatialHash.findNearbyPairs(maxDistance)
        resolve(pairs)
        return
      }

      const id = Date.now().toString() + Math.random()
      this.pendingCalculations.set(id, { resolve, reject })
      
      this.worker.postMessage({
        id,
        type: 'calculateBonds',
        atoms,
        maxDistance
      })
    })
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.pendingCalculations.clear()
  }
}

// Performance monitoring utility
export class PerformanceMonitor {
  private frameCount = 0
  private lastFrameTime = performance.now()
  private fps = 60
  private qualityLevel = 'high'
  private callbacks = new Set<(fps: number, quality: string) => void>()
  private rafId: number | null = null

  start(): void {
    const update = () => {
      const now = performance.now()
      const delta = now - this.lastFrameTime
      
      if (delta >= 1000) { // Update every second
        this.fps = Math.round((this.frameCount * 1000) / delta)
        this.frameCount = 0
        this.lastFrameTime = now
        
        // Adjust quality based on FPS
        if (this.fps < 30) {
          this.qualityLevel = 'low'
        } else if (this.fps < 45) {
          this.qualityLevel = 'medium'
        } else {
          this.qualityLevel = 'high'
        }
        
        // Notify callbacks
        this.callbacks.forEach(callback => callback(this.fps, this.qualityLevel))
      }
      
      this.frameCount++
      this.rafId = requestAnimationFrame(update)
    }
    
    this.rafId = requestAnimationFrame(update)
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  getFPS(): number {
    return this.fps
  }

  getQualityLevel(): string {
    return this.qualityLevel
  }

  onFPSChange(callback: (fps: number, quality: string) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }
}

// Instanced mesh manager for efficient rendering
export class InstancedMeshManager {
  private instances = new Map<string, {
    count: number
    positions: Float32Array
    colors: Float32Array
    scales: Float32Array
  }>()
  private maxInstances = 1000

  addElement(element: string, position: { x: number; y: number; z: number }, color: string, scale: number = 1.0): number {
    if (!this.instances.has(element)) {
      this.instances.set(element, {
        count: 0,
        positions: new Float32Array(this.maxInstances * 3),
        colors: new Float32Array(this.maxInstances * 3),
        scales: new Float32Array(this.maxInstances)
      })
    }

    const instance = this.instances.get(element)!
    if (instance.count >= this.maxInstances) {
      return -1 // Instance limit reached
    }

    const index = instance.count
    const colorRGB = this.hexToRgb(color)

    instance.positions[index * 3] = position.x
    instance.positions[index * 3 + 1] = position.y
    instance.positions[index * 3 + 2] = position.z

    instance.colors[index * 3] = colorRGB.r / 255
    instance.colors[index * 3 + 1] = colorRGB.g / 255
    instance.colors[index * 3 + 2] = colorRGB.b / 255

    instance.scales[index] = scale
    instance.count++

    return index
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 }
  }

  getInstanceData(element: string) {
    return this.instances.get(element)
  }

  getAllInstanceData() {
    return Array.from(this.instances.entries())
  }

  clear(): void {
    this.instances.clear()
  }

  getStats(): { totalElements: number; totalInstances: number } {
    let totalInstances = 0
    this.instances.forEach(instance => {
      totalInstances += instance.count
    })
    return {
      totalElements: this.instances.size,
      totalInstances
    }
  }
}
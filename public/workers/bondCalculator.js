// Bond calculation worker for heavy computational tasks
self.onmessage = function(event) {
  const { id, type, atoms, maxDistance } = event.data
  
  try {
    if (type === 'calculateBonds') {
      const result = calculateBondsOptimized(atoms, maxDistance)
      self.postMessage({ id, result })
    } else {
      self.postMessage({ id, error: 'Unknown operation type' })
    }
  } catch (error) {
    self.postMessage({ id, error: error.message })
  }
}

function calculateBondsOptimized(atoms, maxDistance) {
  const pairs = []
  const processedPairs = new Set()
  const maxDistanceSquared = maxDistance * maxDistance
  
  // Use spatial hashing for O(n log n) performance
  const spatialHash = createSpatialHash(atoms, maxDistance)
  
  for (let i = 0; i < atoms.length; i++) {
    const atom1 = atoms[i]
    
    // Query nearby atoms using spatial hash
    const nearbyAtoms = spatialHash.queryRadius(atom1.x, atom1.y, atom1.z, maxDistance)
    
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
  
  return pairs
}

function createSpatialHash(atoms, cellSize) {
  const cells = new Map()
  
  // Insert atoms into cells
  for (const atom of atoms) {
    const cellX = Math.floor(atom.x / cellSize)
    const cellY = Math.floor(atom.y / cellSize)
    const cellZ = Math.floor(atom.z / cellSize)
    const key = `${cellX},${cellY},${cellZ}`
    
    if (!cells.has(key)) {
      cells.set(key, [])
    }
    cells.get(key).push(atom)
  }
  
  return {
    queryRadius: (centerX, centerY, centerZ, radius) => {
      const nearbyAtoms = []
      const radiusSquared = radius * radius
      
      // Calculate cell range
      const minCellX = Math.floor((centerX - radius) / cellSize)
      const maxCellX = Math.floor((centerX + radius) / cellSize)
      const minCellY = Math.floor((centerY - radius) / cellSize)
      const maxCellY = Math.floor((centerY + radius) / cellSize)
      const minCellZ = Math.floor((centerZ - radius) / cellSize)
      const maxCellZ = Math.floor((centerZ + radius) / cellSize)
      
      // Check each cell
      for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
        for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
          for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ++) {
            const key = `${cellX},${cellY},${cellZ}`
            const cellAtoms = cells.get(key)
            
            if (cellAtoms) {
              for (const atom of cellAtoms) {
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
  }
}

import * as THREE from 'three';
import { Atom, Bond } from '@/types/molecule';

interface GeometryConfig {
  centerElement: string;
  outerElement: string;
  bondLength: number;
  centerColor?: string;
  outerColor?: string;
}

export class GeometryGenerator {
  
  /**
   * Generates a planar regular polygon geometry (Triangular, Pentagonal, Hexagonal, etc.)
   * @param sides Number of vertices (3=Triangle, 5=Pentagon, 6=Hexagon, etc.)
   * @param config Configuration for elements and bond lengths
   */
  static generatePolygon(sides: number, config: GeometryConfig): { atoms: Atom[], bonds: Bond[] } {
    const atoms: Atom[] = [];
    const bonds: Bond[] = [];
    
    // 1. Create Central Atom
    const centerId = `center-${Date.now()}`;
    atoms.push({
      id: centerId,
      element: config.centerElement,
      x: 0,
      y: 0,
      z: 0,
      color: config.centerColor || '#909090'
    });

    // 2. Generate Outer Atoms in a circle (Planar)
    const angleStep = (2 * Math.PI) / sides;
    const startAngle = -Math.PI / 2; 

    for (let i = 0; i < sides; i++) {
      const angle = startAngle + (i * angleStep);
      const x = config.bondLength * Math.cos(angle);
      const y = config.bondLength * Math.sin(angle);
      const z = 0; // Planar

      const atomId = `outer-${i + 1}-${Date.now()}`;
      
      atoms.push({
        id: atomId,
        element: config.outerElement,
        x: parseFloat(x.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        z: parseFloat(z.toFixed(3)),
        color: config.outerColor || '#FFFFFF'
      });

      // 3. Create Bonds from Center to Outer
      bonds.push({
        id: `bond-${i}-${Date.now()}`,
        from: centerId,
        to: atomId,
        type: 'single'
      });
    }

    return { atoms, bonds };
  }

  /**
   * Generates VSEPR 3D geometries (e.g., Octahedral for 6 domains instead of Hexagonal Planar)
   */
  static generateVSEPR(domains: number, config: GeometryConfig): { atoms: Atom[], bonds: Bond[] } {
    // For 3, 5, 6, 7, 8 domains, standard VSEPR geometries differ from flat polygons.
    // 3: Trigonal Planar (Same as Polygon)
    // 5: Trigonal Bipyramidal
    // 6: Octahedral
    // 7: Pentagonal Bipyramidal
    // 8: Square Antiprismatic (or Cubic)

    if (domains === 3) return this.generatePolygon(3, config); // Trigonal Planar
    
    const atoms: Atom[] = [];
    const bonds: Bond[] = [];
    const centerId = `center-${Date.now()}`;
    
    // Central Atom
    atoms.push({
      id: centerId,
      element: config.centerElement,
      x: 0, y: 0, z: 0,
      color: config.centerColor || '#909090'
    });

    const positions: THREE.Vector3[] = [];

    if (domains === 5) {
      // Trigonal Bipyramidal
      // 3 equatorial (120 deg), 2 axial (180 deg)
      positions.push(new THREE.Vector3(0, 1, 0)); // Axial Up
      positions.push(new THREE.Vector3(0, -1, 0)); // Axial Down
      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 3;
        positions.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
      }
    } else if (domains === 6) {
      // Octahedral
      positions.push(new THREE.Vector3(1, 0, 0));
      positions.push(new THREE.Vector3(-1, 0, 0));
      positions.push(new THREE.Vector3(0, 1, 0));
      positions.push(new THREE.Vector3(0, -1, 0));
      positions.push(new THREE.Vector3(0, 0, 1));
      positions.push(new THREE.Vector3(0, 0, -1));
    } else if (domains === 7) {
      // Pentagonal Bipyramidal
      positions.push(new THREE.Vector3(0, 1, 0)); // Axial Up
      positions.push(new THREE.Vector3(0, -1, 0)); // Axial Down
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        positions.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
      }
    } else if (domains === 8) {
        // Square Antiprismatic (approximate)
        // Top square rotated 45 deg relative to bottom square
        const h = 0.7;
        const r = 1.0;
        
        // Top square
        for(let i=0; i<4; i++) {
             const angle = (i * Math.PI / 2);
             positions.push(new THREE.Vector3(r*Math.cos(angle), h, r*Math.sin(angle)));
        }
        
        // Bottom square (rotated 45 deg)
        for(let i=0; i<4; i++) {
             const angle = (i * Math.PI / 2) + (Math.PI/4);
             positions.push(new THREE.Vector3(r*Math.cos(angle), -h, r*Math.sin(angle)));
        }
    } else {
        // Default fallback to planar polygon
        return this.generatePolygon(domains, config);
    }

    // Convert vectors to Atoms/Bonds
    positions.forEach((pos, i) => {
      // Normalize and scale
      pos.normalize().multiplyScalar(config.bondLength);
      
      const atomId = `outer-${i + 1}-${Date.now()}`;
      atoms.push({
        id: atomId,
        element: config.outerElement,
        x: parseFloat(pos.x.toFixed(3)),
        y: parseFloat(pos.y.toFixed(3)),
        z: parseFloat(pos.z.toFixed(3)),
        color: config.outerColor || '#FFFFFF'
      });
      bonds.push({
        id: `bond-${i}-${Date.now()}`,
        from: centerId,
        to: atomId,
        type: 'single'
      });
    });

    return { atoms, bonds };
  }
}

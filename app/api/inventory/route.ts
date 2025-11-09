import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

// Sample inventory data
const DEFAULT_INVENTORY = [
  { id: '1', name: 'Hydrochloric Acid', formula: 'HCl', quantity: 500, unit: 'ml', minQuantity: 100, category: 'Acids', hazard: 'high' },
  { id: '2', name: 'Sodium Hydroxide', formula: 'NaOH', quantity: 300, unit: 'g', minQuantity: 50, category: 'Bases', hazard: 'high' },
  { id: '3', name: 'Sodium Chloride', formula: 'NaCl', quantity: 1000, unit: 'g', minQuantity: 200, category: 'Salts', hazard: 'low' },
  { id: '4', name: 'Silver Nitrate', formula: 'AgNO₃', quantity: 50, unit: 'g', minQuantity: 10, category: 'Salts', hazard: 'medium' },
  { id: '5', name: 'Copper Sulfate', formula: 'CuSO₄', quantity: 200, unit: 'g', minQuantity: 50, category: 'Salts', hazard: 'medium' },
  { id: '6', name: 'Sulfuric Acid', formula: 'H₂SO₄', quantity: 400, unit: 'ml', minQuantity: 100, category: 'Acids', hazard: 'high' },
  { id: '7', name: 'Ammonia', formula: 'NH₃', quantity: 250, unit: 'ml', minQuantity: 50, category: 'Bases', hazard: 'medium' },
  { id: '8', name: 'Potassium Permanganate', formula: 'KMnO₄', quantity: 100, unit: 'g', minQuantity: 20, category: 'Oxidizers', hazard: 'medium' },
  { id: '9', name: 'Ethanol', formula: 'C₂H₅OH', quantity: 500, unit: 'ml', minQuantity: 100, category: 'Solvents', hazard: 'medium' },
  { id: '10', name: 'Distilled Water', formula: 'H₂O', quantity: 5000, unit: 'ml', minQuantity: 1000, category: 'Solvents', hazard: 'low' },
  { id: '11', name: 'Phenolphthalein', formula: 'C₂₀H₁₄O₄', quantity: 30, unit: 'ml', minQuantity: 10, category: 'Indicators', hazard: 'low' },
  { id: '12', name: 'Methyl Orange', formula: 'C₁₄H₁₄N₃NaO₃S', quantity: 25, unit: 'g', minQuantity: 5, category: 'Indicators', hazard: 'low' },
  { id: '13', name: 'Barium Chloride', formula: 'BaCl₂', quantity: 80, unit: 'g', minQuantity: 20, category: 'Salts', hazard: 'high' },
  { id: '14', name: 'Iron(III) Chloride', formula: 'FeCl₃', quantity: 150, unit: 'g', minQuantity: 30, category: 'Salts', hazard: 'medium' },
  { id: '15', name: 'Acetic Acid', formula: 'CH₃COOH', quantity: 300, unit: 'ml', minQuantity: 50, category: 'Acids', hazard: 'medium' },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const client = await clientPromise
    const db = client.db('chemlab')
    
    // Get user's inventory or create default
    let inventory = await db.collection('inventory').findOne({ 
      userEmail: session.user.email 
    })
    
    if (!inventory) {
      // Create default inventory for new user
      const newInventory = {
        userEmail: session.user.email,
        inventory: DEFAULT_INVENTORY,
        createdAt: new Date()
      }
      const result = await db.collection('inventory').insertOne(newInventory as any)
      inventory = { ...newInventory, _id: result.insertedId } as any
    }
    
    return NextResponse.json({ 
      inventory: inventory?.inventory || DEFAULT_INVENTORY 
    })
  } catch (error) {
    console.error('Inventory GET error:', error)
    return NextResponse.json({ 
      inventory: DEFAULT_INVENTORY 
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, change } = await request.json()
    
    const client = await clientPromise
    const db = client.db('chemlab')
    
    // Update quantity
    await db.collection('inventory').updateOne(
      { 
        userEmail: session.user.email,
        'inventory.id': id
      },
      { 
        $inc: { 'inventory.$.quantity': change },
        $set: { 'inventory.$.lastUsed': new Date() }
      }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Inventory PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}

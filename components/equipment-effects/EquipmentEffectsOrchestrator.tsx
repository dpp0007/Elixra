/**
 * Equipment Effects Orchestrator
 * Manages all equipment animations and enforces stacking rules
 */

'use client'

import { AnimatePresence } from 'framer-motion'
import { EquipmentAttachment } from '@/lib/equipment-animations'
import BunsenBurner from './BunsenBurner'
import HotPlate from './HotPlate'
import MagneticStirrer from './MagneticStirrer'
import PhMeter from './PhMeter'
import Thermometer from './Thermometer'
import AnalyticalBalance from './AnalyticalBalance'
import LabTimer from './LabTimer'
import Centrifuge from './Centrifuge'

import { ChemicalContent } from '@/types/chemistry'
import { calculatePH, formatPH } from '@/lib/ph-calculator'

interface EquipmentEffectsOrchestratorProps {
    tubeId: string
    tubePosition: { x: number; y: number; width: number; height: number }
    attachments: EquipmentAttachment[]
    contents?: ChemicalContent[] // For dynamic pH calculation
    liquidLayers?: { color: string; density: number }[] // For centrifuge separation
    onEquipmentChange?: (attachments: EquipmentAttachment[]) => void // For timer controls
}

export default function EquipmentEffectsOrchestrator({
    tubeId,
    tubePosition,
    attachments,
    contents = [],
    liquidLayers = [],
    onEquipmentChange,
}: EquipmentEffectsOrchestratorProps) {
    // Filter attachments for this specific tube
    const tubeAttachments = attachments.filter(
        a => a.targetTubeId === tubeId && a.isActive
    )

    console.log(`🔧 EquipmentEffectsOrchestrator[${tubeId}]:`, {
        totalAttachments: attachments.length,
        tubeAttachments: tubeAttachments.length,
        tubePosition,
        attachments: attachments.map(a => ({ 
            type: a.equipmentType, 
            target: a.targetTubeId, 
            active: a.isActive 
        }))
    })

    // Calculate dynamic pH from contents
    const dynamicPH = contents.length > 0 ? formatPH(calculatePH(contents)) : 0.0

    // Find active equipment by type
    const bunsenBurner = tubeAttachments.find(a => a.equipmentType === 'bunsen-burner')
    const hotPlate = tubeAttachments.find(a => a.equipmentType === 'hot-plate')
    const stirrer = tubeAttachments.find(a => a.equipmentType === 'magnetic-stirrer')
    const phMeter = tubeAttachments.find(a => a.equipmentType === 'ph-meter')
    const thermometer = tubeAttachments.find(a => a.equipmentType === 'thermometer')
    const balance = tubeAttachments.find(a => a.equipmentType === 'analytical-balance')
    const timer = tubeAttachments.find(a => a.equipmentType === 'timer')
    const centrifuge = tubeAttachments.find(a => a.equipmentType === 'centrifuge')

    console.log(`🔧 EquipmentEffectsOrchestrator[${tubeId}] - Found equipment:`, {
        bunsenBurner: !!bunsenBurner,
        hotPlate: !!hotPlate,
        stirrer: !!stirrer,
        phMeter: !!phMeter,
        thermometer: !!thermometer,
        balance: !!balance,
        timer: !!timer,
        centrifuge: !!centrifuge
    })

    // CRITICAL FIX: Enforce heating equipment exclusivity
    // Only one heating device can be active at a time
    let activeHeater = null
    if (bunsenBurner && hotPlate) {
        console.warn('⚠️ EXCLUSIVITY VIOLATION: Both heating devices active. Using Bunsen Burner.')
        activeHeater = bunsenBurner
    } else if (bunsenBurner) {
        activeHeater = bunsenBurner
    } else if (hotPlate) {
        activeHeater = hotPlate
    }

    // CRITICAL FIX: Enforce motion equipment exclusivity
    // Stirrer and centrifuge cannot operate simultaneously
    let activeMotion = null
    if (stirrer && centrifuge) {
        console.warn('⚠️ EXCLUSIVITY VIOLATION: Both motion devices active. Using Centrifuge.')
        activeMotion = centrifuge
    } else if (stirrer) {
        activeMotion = stirrer
    } else if (centrifuge) {
        activeMotion = centrifuge
    }

    // Calculate dynamic temperature based on heating equipment
    const calculateTemperature = (): number => {
        const ROOM_TEMP = 25 // °C
        const EMPTY_TUBE_INDICATOR = -999 // Special value to indicate empty tube

        // If tube is empty, return special indicator
        if (contents.length === 0) return EMPTY_TUBE_INDICATOR

        let temperature = ROOM_TEMP

        // Use only the active heater (exclusivity enforced)
        if (activeHeater) {
            if (activeHeater.equipmentType === 'bunsen-burner') {
                const burnerTemp = activeHeater.settings.temperature || 0
                // Burner heats solution: 0-1000°C burner → 25-300°C solution
                temperature = ROOM_TEMP + (burnerTemp / 1000) * 275
            } else if (activeHeater.equipmentType === 'hot-plate') {
                const plateTemp = activeHeater.settings.temperature || 0
                // Hot plate heats solution: 25-300°C plate → 25-300°C solution
                temperature = Math.max(temperature, plateTemp)
            }
        }

        // Stirring adds minimal heat from friction (only if stirrer is active motion device)
        if (activeMotion?.equipmentType === 'magnetic-stirrer') {
            const rpm = activeMotion.settings.rpm || 0
            // High RPM adds ~1-2°C from friction
            temperature += (rpm / 1500) * 2
        }

        return Math.round(temperature * 10) / 10 // Round to 1 decimal
    }

    const dynamicTemperature = calculateTemperature()

    // Calculate dynamic weight based on tube contents
    const calculateWeight = (): number => {
        if (contents.length === 0) return 0

        // Sum up all chemical masses
        // Assume: 1ml of solution ≈ 1g (water density)
        // For solids (g), use direct mass
        let totalWeight = 0

        contents.forEach(content => {
            if (content.unit === 'g') {
                // Solid - direct mass
                totalWeight += content.amount
            } else if (content.unit === 'ml') {
                // Liquid - assume density ≈ 1 g/ml
                totalWeight += content.amount
            } else if (content.unit === 'drops') {
                // Drops - 1 drop ≈ 0.05 ml ≈ 0.05 g
                totalWeight += content.amount * 0.05
            }
        })

        return totalWeight
    }

    const dynamicWeight = calculateWeight()

    // HIGH PRIORITY FIX: Timer control callbacks
    const handleTimerPause = () => {
        if (!timer || !onEquipmentChange) return
        const updatedAttachments = attachments.map(a => {
            if (a.equipmentId === timer.equipmentId) {
                return {
                    ...a,
                    settings: {
                        ...a.settings,
                        isTimerRunning: false
                    }
                }
            }
            return a
        })
        onEquipmentChange(updatedAttachments)
    }

    const handleTimerResume = () => {
        if (!timer || !onEquipmentChange) return
        const updatedAttachments = attachments.map(a => {
            if (a.equipmentId === timer.equipmentId) {
                return {
                    ...a,
                    settings: {
                        ...a.settings,
                        isTimerRunning: true
                    }
                }
            }
            return a
        })
        onEquipmentChange(updatedAttachments)
    }

    const handleTimerReset = () => {
        if (!timer || !onEquipmentChange) return
        // Reset to initial duration (stored in equipment config)
        const initialDuration = 300 // 5 minutes default, should come from config
        const updatedAttachments = attachments.map(a => {
            if (a.equipmentId === timer.equipmentId) {
                return {
                    ...a,
                    settings: {
                        ...a.settings,
                        timeRemaining: initialDuration,
                        isTimerRunning: false
                    }
                }
            }
            return a
        })
        onEquipmentChange(updatedAttachments)
    }

    // Equipment must be positioned relative to tube, not viewport
    // Wrapper uses high z-index to ensure equipment layer sits above page content
    return (
        <div className="pointer-events-none" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
            <AnimatePresence>
                {/* Balance - Lowest layer (z-index 95-97) */}
                {balance && (
                    <AnalyticalBalance
                        key={`balance-${tubeId}`}
                        weight={dynamicWeight}
                        tareOffset={balance.settings.tareOffset || 0}
                        isActive={balance.isActive}
                        tubePosition={tubePosition}
                    />
                )}

                {/* Heating equipment - Base layer (z-index 98-100) - EXCLUSIVITY ENFORCED */}
                {activeHeater?.equipmentType === 'bunsen-burner' && (
                    <BunsenBurner
                        key={`bunsen-${tubeId}`}
                        temperature={activeHeater.settings.temperature || 0}
                        isActive={activeHeater.isActive}
                        tubePosition={tubePosition}
                    />
                )}

                {activeHeater?.equipmentType === 'hot-plate' && (
                    <HotPlate
                        key={`hotplate-${tubeId}`}
                        temperature={activeHeater.settings.temperature || 25}
                        isActive={activeHeater.isActive}
                        tubePosition={tubePosition}
                    />
                )}

                {/* Motion equipment - Physical effects layer (z-index 98-102) - EXCLUSIVITY ENFORCED */}
                {activeMotion?.equipmentType === 'magnetic-stirrer' && (
                    <MagneticStirrer
                        key={`stirrer-${tubeId}`}
                        rpm={activeMotion.settings.rpm || 0}
                        isActive={activeMotion.isActive}
                        tubePosition={tubePosition}
                    />
                )}

                {/* Centrifuge - Overrides all motion (z-index 108-111) */}
                {activeMotion?.equipmentType === 'centrifuge' && (
                    <Centrifuge
                        key={`centrifuge-${tubeId}`}
                        rpm={activeMotion.settings.rpm || 0}
                        isActive={activeMotion.isActive}
                        tubePosition={tubePosition}
                        liquidLayers={liquidLayers}
                    />
                )}

                {/* Measurement overlays - Top layer (z-index 103-105) */}
                {phMeter && (
                    <PhMeter
                        key={`ph-${tubeId}`}
                        pH={dynamicPH}
                        isActive={phMeter.isActive}
                        tubePosition={tubePosition}
                    />
                )}

                {thermometer && (
                    <Thermometer
                        key={`thermometer-${tubeId}`}
                        measuredTemp={dynamicTemperature}
                        isActive={thermometer.isActive}
                        tubePosition={tubePosition}
                    />
                )}

                {/* Timer - UI overlay (z-index 106) */}
                {timer && (
                    <LabTimer
                        key={`timer-${tubeId}`}
                        timeRemaining={timer.settings.timeRemaining || 0}
                        timerMode={timer.settings.timerMode || 'countdown'}
                        isTimerRunning={timer.settings.isTimerRunning || false}
                        isActive={timer.isActive}
                        tubePosition={tubePosition}
                        onPause={handleTimerPause}
                        onResume={handleTimerResume}
                        onReset={handleTimerReset}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

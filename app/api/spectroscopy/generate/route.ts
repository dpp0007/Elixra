import { NextRequest, NextResponse } from 'next/server'

// Validation Schema (Basic)
function validateRequest(body: any) {
  if (!body.compound || typeof body.compound !== 'string') return 'Invalid compound name'
  if (!body.formula || typeof body.formula !== 'string') return 'Invalid formula'
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationError = validateRequest(body)
    
    if (validationError) {
        return NextResponse.json({
            error: 'Validation Error',
            details: validationError
        }, { status: 400 })
    }

    const { compound, formula } = body
    
    // Default to 127.0.0.1 to avoid localhost resolution issues
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

    const extractJsonCandidate = (raw: string) => {
      let candidate = raw.trim()
      candidate = candidate.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      const firstBrace = candidate.indexOf('{')
      if (firstBrace !== -1) candidate = candidate.slice(firstBrace)
      return candidate.trim()
    }

    const closeJsonStructure = (raw: string) => {
      let s = raw.trim()

      if (/"\w+$/.test(s)) {
        s = s.replace(/,?\s*"\w+$/, '')
      }

      if (s.endsWith(',')) s = s.slice(0, -1).trimEnd()

      if (/:\s*$/.test(s)) {
        s = s.replace(/,\s*"[^"]+"\s*:\s*$/, '').replace(/"[^"]+"\s*:\s*$/, '')
      }

      let inString = false
      let escaped = false
      const stack: Array<'{' | '['> = []

      for (let i = 0; i < s.length; i++) {
        const ch = s[i]

        if (inString) {
          if (escaped) {
            escaped = false
            continue
          }
          if (ch === '\\') {
            escaped = true
            continue
          }
          if (ch === '"') inString = false
          continue
        }

        if (ch === '"') {
          inString = true
          continue
        }

        if (ch === '{' || ch === '[') stack.push(ch)
        else if (ch === '}' || ch === ']') stack.pop()
      }

      if (inString) s += '"'

      while (stack.length) {
        const top = stack.pop()
        s += top === '{' ? '}' : ']'
      }

      return s
    }

    const parseSection = (raw: string) => {
      const fixed = closeJsonStructure(extractJsonCandidate(raw))
      return JSON.parse(fixed)
    }

    const callChat = async (message: string, context: string) => {
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
          'X-Service-Name': 'spectroscopy-api',
        },
        body: JSON.stringify({
          message,
          context,
          chemicals: [],
        }),
      })

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
          const text = await response.text()
          if (text.includes('This page could not be found') || text.includes('Next.js')) {
              throw new Error(`Backend URL (${backendUrl}) appears to be pointing to the frontend application. Please ensure the Python backend is running on port 8000.`)
          }
          throw new Error(`Backend returned HTML instead of JSON. Status: ${response.status}`)
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        if (response.status >= 500) {
          throw new Error('AI Service temporarily unavailable.')
        }
        throw new Error(`Backend service returned ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue
            try {
              const data = JSON.parse(trimmed)
              if (data?.token) fullText += data.token
            } catch {
              // ignore
            }
          }
        }

        const finalLine = buffer.trim()
        if (finalLine) {
          try {
            const data = JSON.parse(finalLine)
            if (data?.token) fullText += data.token
          } catch {
            // ignore
          }
        }
      }

      return fullText
    }

    const generateSection = async (primaryPrompt: string, fallbackPrompt: string, context: string) => {
      const normalizeParsed = (parsed: any) => {
          if (parsed?.peaks && Array.isArray(parsed.peaks)) return parsed
          // Handle case where AI returns direct array
          if (Array.isArray(parsed)) return { peaks: parsed }
          // Handle case where AI returns object with different key like "data"
          if (parsed?.data && Array.isArray(parsed.data)) return { peaks: parsed.data }
          return null
      }

      try {
        const raw = await callChat(primaryPrompt, context)
        const parsed = parseSection(raw)
        const normalized = normalizeParsed(parsed)
        if (normalized) return normalized
      } catch {
        // ignore
      }

      try {
        const raw = await callChat(fallbackPrompt, context)
        const parsed = parseSection(raw)
        const normalized = normalizeParsed(parsed)
        if (normalized) return normalized
      } catch {
        // ignore
      }

      return { peaks: [] as any[] }
    }
    
    const context = `Spectroscopy generation for ${compound}`

    const uvPrompt = `Generate comprehensive UV-Vis peaks for ${compound} (${formula}). 
    CRITICAL: You must return valid JSON containing a "peaks" array with AT LEAST 4 peaks. Do not return a single peak.
    Example format:
    {
      "peaks": [
        {"wavelength": 286, "absorbance": 1.2, "label": "λmax", "transition": "π→π*", "interpretation": "Conjugated system involved in primary absorption"},
        {"wavelength": 240, "absorbance": 0.8, "label": "Band II", "transition": "π→π*", "interpretation": "Secondary aromatic ring absorption"},
        {"wavelength": 210, "absorbance": 0.5, "label": "Band III", "transition": "n→π*", "interpretation": "Forbidden transition of carbonyl lone pair"},
        {"wavelength": 190, "absorbance": 0.9, "label": "End absorption", "transition": "σ→σ*", "interpretation": "High energy bond transition"}
      ]
    }
    Return ONLY valid JSON (no markdown). Use subscripts for chemical formulas in text (e.g. H₂O instead of H2O, C₆H₆ instead of C6H6).`

    const uvFallback = `Generate UV-Vis peaks for ${compound} (${formula}). Return valid JSON with "peaks" array containing exactly 4 peaks with full details. Use subscripts for formulas.`

    const irPrompt = `Generate detailed IR peaks for ${compound} (${formula}).
    CRITICAL: You must return valid JSON containing a "peaks" array with AT LEAST 6 peaks. Do not return a single peak.
    Example format:
    {
      "peaks": [
        {"wavenumber": 3300, "transmittance": 20, "label": "O-H", "functionalGroup": "O-H stretch", "interpretation": "Broad absorption band indicating hydrogen-bonded hydroxyl group"},
        {"wavenumber": 3050, "transmittance": 60, "label": "C-H (sp²)", "functionalGroup": "C-H stretch", "interpretation": "Sharp peak characteristic of aromatic C-H bonds"},
        {"wavenumber": 2950, "transmittance": 50, "label": "C-H (sp³)", "functionalGroup": "C-H stretch", "interpretation": "Alkyl C-H stretching vibration"},
        {"wavenumber": 1715, "transmittance": 15, "label": "C=O", "functionalGroup": "C=O stretch", "interpretation": "Strong, sharp peak typical of a ketone carbonyl group"},
        {"wavenumber": 1600, "transmittance": 40, "label": "C=C", "functionalGroup": "C=C stretch", "interpretation": "Aromatic ring breathing vibration"},
        {"wavenumber": 1450, "transmittance": 55, "label": "CH₂", "functionalGroup": "C-H bend", "interpretation": "Scissoring bending vibration of methylene group"}
      ]
    }
    Return ONLY valid JSON (no markdown). Use subscripts for chemical formulas in text (e.g. CH₂ instead of CH2, C=O).`

    const irFallback = `Generate IR peaks for ${compound} (${formula}). Return valid JSON with "peaks" array containing exactly 6 peaks with full details. Use subscripts for formulas.`

    const nmrPrompt = `Generate detailed 1H NMR peaks for ${compound} (${formula}).
    CRITICAL: You must return valid JSON containing a "peaks" array with AT LEAST 5 peaks. Do not return a single peak.
    Example format:
    {
      "peaks": [
        {"shift": 7.26, "intensity": 80, "label": "Ar-H", "multiplicity": "multiplet", "integration": 5, "interpretation": "Deshielded aromatic protons due to ring current effect", "molecularFeature": "Aromatic Ring"},
        {"shift": 5.50, "intensity": 60, "label": "OH", "multiplicity": "broad singlet", "integration": 1, "interpretation": "Exchangeable hydroxyl proton, position varies with concentration", "molecularFeature": "Hydroxyl Group"},
        {"shift": 3.80, "intensity": 90, "label": "O-CH₂", "multiplicity": "quartet", "integration": 2, "interpretation": "Methylene protons deshielded by adjacent oxygen atom", "molecularFeature": "Ether Linkage"},
        {"shift": 2.10, "intensity": 95, "label": "CO-CH₃", "multiplicity": "singlet", "integration": 3, "interpretation": "Methyl protons adjacent to electron-withdrawing carbonyl", "molecularFeature": "Acetyl Group"},
        {"shift": 1.20, "intensity": 100, "label": "CH₃", "multiplicity": "triplet", "integration": 3, "interpretation": "Terminal methyl group protons", "molecularFeature": "Alkyl Chain"}
      ]
    }
    Return ONLY valid JSON (no markdown). Use subscripts for chemical formulas in text (e.g. CH₃ instead of CH3, CH₂ instead of CH2).`

    const nmrFallback = `Generate 1H NMR peaks for ${compound} (${formula}). Return valid JSON with "peaks" array containing exactly 5 peaks with full details. Use subscripts for formulas.`

    const [uv, ir, nmr] = await Promise.all([
      generateSection(uvPrompt, uvFallback, `${context} (uv-vis)`),
      generateSection(irPrompt, irFallback, `${context} (ir)`),
      generateSection(nmrPrompt, nmrFallback, `${context} (nmr)`),
    ])

    const normalized = {
      'uv-vis': uv,
      ir,
      nmr,
    }

    return NextResponse.json({ 
      success: true,
      data: normalized,
      generatedAt: new Date().toISOString(),
      model: 'gemini-pro', // Log model version
      requestId: crypto.randomUUID()
    })

  } catch (error) {
    console.error('Spectroscopy generation error:', error)
    
    // Return structured error for frontend
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error',
      type: 'system_error',
      retryable: true 
    }, { status: 500 })
  }
}

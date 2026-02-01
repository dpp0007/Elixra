import { PERIODIC_TABLE } from './periodicTable'

export interface MolecularOperation {
  type: 'ADD_COMPLEX'
  subjectElement: string
  count: number
  bondType: 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen'
  targetElement: string
}

const NUMBER_MAP: { [key: string]: number } = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
  'a': 1, 'an': 1
}

export function parseNaturalLanguageCommand(text: string): MolecularOperation | null {
  const t = text.toLowerCase().trim()
  
  const numberPattern = '(\\d+|one|two|three|four|five|six|a|an)'
  const elementPattern = '([a-z]+)'
  const bondPattern = '(single|double|triple|ionic|hydrogen)'
  
  // Pattern 1: "add 4 hydrogen atoms single-bonded to a carbon atom"
  const regex1 = new RegExp(`add\\s+${numberPattern}\\s+${elementPattern}\\s*(?:atoms?)?\\s*(?:${bondPattern}-bonded|bonded|attached)\\s+to\\s+(?:a\\s+|an\\s+)?${elementPattern}`, 'i')
  
  const match1 = t.match(regex1)
  if (match1) {
    const [_, countStr, subjectName, bondTypeStr, targetName] = match1
    const count = parseInt(countStr) || NUMBER_MAP[countStr] || 1
    const bondType = (bondTypeStr || 'single') as any
    const subject = findElement(subjectName)
    const target = findElement(targetName)
    
    if (subject && target) {
      return {
        type: 'ADD_COMPLEX',
        subjectElement: subject.symbol,
        count,
        bondType,
        targetElement: target.symbol
      }
    }
  }

  // Pattern 2: "add a carbon single bonded with 4 hydrogen"
  // Target first, Subject second
  const regex2 = new RegExp(`add\\s+(?:a\\s+|an\\s+)?${elementPattern}\\s*(?:atoms?)?\\s*(?:${bondPattern}-bonded|bonded|attached|connected)\\s+(?:with|to)\\s+${numberPattern}\\s+${elementPattern}`, 'i')
  
  const match2 = t.match(regex2)
  if (match2) {
    const [_, targetName, bondTypeStr, countStr, subjectName] = match2
    const count = parseInt(countStr) || NUMBER_MAP[countStr] || 1
    const bondType = (bondTypeStr || 'single') as any
    const subject = findElement(subjectName)
    const target = findElement(targetName)
    
    if (subject && target) {
      return {
        type: 'ADD_COMPLEX',
        subjectElement: subject.symbol,
        count,
        bondType,
        targetElement: target.symbol
      }
    }
  }
  
  return null
}

function findElement(name: string) {
  // Handle common names not in table if needed, but table has names
  return PERIODIC_TABLE.find(e => 
    e.name.toLowerCase() === name.toLowerCase() || 
    e.symbol.toLowerCase() === name.toLowerCase()
  )
}

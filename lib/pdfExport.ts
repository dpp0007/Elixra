import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Experiment, ReactionResult } from '@/types/chemistry'

export interface ExperimentReport {
  experiment: Experiment
  result: ReactionResult
  date: Date
  author?: string
}

export function generateExperimentPDF(report: ExperimentReport): void {
  try {
    // Validate input
    if (!report || !report.experiment || !report.result) {
      throw new Error('Invalid experiment report data')
    }

    if (!report.experiment.chemicals || report.experiment.chemicals.length === 0) {
      throw new Error('No chemicals found in experiment')
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Chemical Experiment Report', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // Date and Author
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = report.date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  doc.text(`Date: ${dateStr}`, margin, yPosition)
  yPosition += 6
  if (report.author) {
    doc.text(`Author: ${report.author}`, margin, yPosition)
    yPosition += 6
  }
  yPosition += 5

  // Abstract Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Abstract', margin, yPosition)
  yPosition += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const abstractText = `This report documents a chemical reaction experiment involving ${report.experiment.chemicals.length} reagent(s). The experiment was conducted to observe and analyze the chemical interactions and resulting products.`
  const abstractLines = doc.splitTextToSize(abstractText, pageWidth - 2 * margin)
  doc.text(abstractLines, margin, yPosition)
  yPosition += abstractLines.length * 5 + 10

  // Materials and Methods
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Materials and Methods', margin, yPosition)
  yPosition += 8

  doc.setFontSize(11)
  doc.text('1.1 Reagents', margin, yPosition)
  yPosition += 6

    // Chemicals Table
    const chemicalsData = report.experiment.chemicals.map((chem, index) => [
      (index + 1).toString(),
      chem.chemical?.name || 'Unknown',
      chem.chemical?.formula || 'N/A',
      `${chem.amount || 0} ${chem.unit || 'g'}`,
      chem.chemical?.hazards || 'N/A'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Chemical Name', 'Formula', 'Amount', 'Hazard']],
      body: chemicalsData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = margin
  }

  // Experimental Procedure
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('1.2 Procedure', margin, yPosition)
  yPosition += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const procedureText = `The reagents were combined in a controlled laboratory environment. The reaction was allowed to proceed at room temperature with continuous observation. Safety protocols were followed throughout the experiment.`
  const procedureLines = doc.splitTextToSize(procedureText, pageWidth - 2 * margin)
  doc.text(procedureLines, margin, yPosition)
  yPosition += procedureLines.length * 5 + 10

  // Results Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Results', margin, yPosition)
  yPosition += 8

  // Balanced Equation
  if (report.result.balancedEquation) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2.1 Chemical Equation', margin, yPosition)
    yPosition += 6
    doc.setFontSize(10)
    doc.setFont('courier', 'normal')
    doc.text(report.result.balancedEquation, margin + 5, yPosition)
    yPosition += 10
  }

  // Observations
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('2.2 Observations', margin, yPosition)
  yPosition += 6

  const observationsData = [
    ['Color', report.result.color || 'Not observed'],
    ['Precipitate', report.result.precipitate ? 'Yes' : 'No'],
    ['Gas Evolution', report.result.gasEvolution ? 'Yes' : 'No'],
    ['Temperature', report.result.temperatureChange ? report.result.temperatureChange : (report.result.temperature || 'Not measured')],
    ['Odor', report.result.smell || 'None detected'],
    ['pH Change', report.result.phChange || 'None'],
    ['State Change', report.result.stateChange || 'None']
  ]

    autoTable(doc, {
      startY: yPosition,
      body: observationsData,
      theme: 'striped',
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = margin
  }

  // 2.3 Instrument Analysis
  if (report.result.instrumentAnalysis) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2.3 Instrument Analysis', margin, yPosition)
    yPosition += 6

    const instrumentData = [
      ['Method', report.result.instrumentAnalysis.name],
      ['Intensity', report.result.instrumentAnalysis.intensity],
      ['Change Observed', report.result.instrumentAnalysis.change],
      ['Outcome Difference', report.result.instrumentAnalysis.outcomeDifference]
    ]

    autoTable(doc, {
      startY: yPosition,
      body: instrumentData,
      theme: 'grid',
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = margin
  }

  // 2.4 Products Information
  if (report.result.productsInfo && report.result.productsInfo.length > 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2.4 Products Analysis', margin, yPosition)
    yPosition += 6

    const productsData = report.result.productsInfo.map(prod => [
      prod.name,
      prod.state,
      prod.color,
      prod.characteristics,
      prod.safetyHazards
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Product', 'State', 'Color', 'Characteristics', 'Hazards']],
      body: productsData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = margin
  }

  // 2.5 Reaction Mechanism & Explanation
  if (report.result.explanation) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2.5 Reaction Mechanism', margin, yPosition)
    yPosition += 6

    const explanationData = [
      ['Mechanism', report.result.explanation.mechanism],
      ['Bond Breaking', report.result.explanation.bondBreaking],
      ['Energy Profile', report.result.explanation.energyProfile],
      ['Atomic Level', report.result.explanation.atomicLevel],
      ['Key Concept', report.result.explanation.keyConcept]
    ]

    if (report.result.explanation.electronTransfer) {
      explanationData.splice(2, 0, ['Electron Transfer', report.result.explanation.electronTransfer])
    }

    autoTable(doc, {
      startY: yPosition,
      body: explanationData,
      theme: 'striped',
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = margin
  }

  // 2.6 Safety Information
  if (report.result.safety) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2.6 Safety Assessment', margin, yPosition)
    yPosition += 6

    const safetyData = [
      ['Risk Level', report.result.safety.riskLevel],
      ['Precautions', report.result.safety.precautions],
      ['First Aid', report.result.safety.firstAid],
      ['Disposal', report.result.safety.disposal],
      ['General Hazards', report.result.safety.generalHazards]
    ]

    autoTable(doc, {
      startY: yPosition,
      body: safetyData,
      theme: 'grid',
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40, fillColor: [255, 240, 240] }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Detailed Observations
  if (report.result.observations && report.result.observations.length > 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2.3 Detailed Observations', margin, yPosition)
    yPosition += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    report.result.observations.forEach((obs, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(`${index + 1}. ${obs}`, margin + 5, yPosition)
      yPosition += 6
    })
    yPosition += 5
  }

  // Discussion
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('3. Discussion', margin, yPosition)
  yPosition += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const discussionText = report.result.observations && report.result.observations.length > 0
    ? report.result.observations.join(' ')
    : 'The observed reaction proceeded as expected based on the chemical properties of the reagents. The formation of products was confirmed through visual observation and analysis of the reaction characteristics.'
  
  const discussionLines = doc.splitTextToSize(discussionText, pageWidth - 2 * margin)
  
  if (yPosition + discussionLines.length * 5 > pageHeight - 40) {
    doc.addPage()
    yPosition = margin
  }
  
  doc.text(discussionLines, margin, yPosition)
  yPosition += discussionLines.length * 5 + 10

  // Conclusion
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('4. Conclusion', margin, yPosition)
  yPosition += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const conclusionText = `The experiment successfully demonstrated the chemical reaction between the selected reagents. The observed changes in color, state, and other physical properties confirmed the formation of reaction products. This experiment provides valuable insights into the chemical behavior of the studied compounds.`
  
  const conclusionLines = doc.splitTextToSize(conclusionText, pageWidth - 2 * margin)
  
  if (yPosition + conclusionLines.length * 5 > pageHeight - 30) {
    doc.addPage()
    yPosition = margin
  }
  
  doc.text(conclusionLines, margin, yPosition)

    // Footer on all pages
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
      doc.text(
        'Generated by Elixra - Virtual Chemistry Laboratory',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      )
    }

    // Save the PDF
    const filename = `experiment_report_${report.date.getTime()}.pdf`
    doc.save(filename)
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

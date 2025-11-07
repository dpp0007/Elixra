import { CurriculumLesson, Quiz } from '@/types/features'

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  // High School Level
  {
    id: 'hs-acids-bases',
    title: 'Introduction to Acids and Bases',
    gradeLevel: 'high-school',
    subject: 'General Chemistry',
    objectives: [
      'Identify common acids and bases',
      'Understand pH scale',
      'Perform neutralization reactions',
      'Observe color changes with indicators'
    ],
    experiments: ['acid-base-1', 'indicator-test', 'neutralization'],
    duration: 45,
    quiz: {
      id: 'hs-acids-bases-quiz',
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'What is the pH of a neutral solution?',
          options: ['0', '7', '14', '1'],
          correctAnswer: 1,
          explanation: 'A neutral solution has a pH of 7, which is neither acidic nor basic.'
        },
        {
          id: 'q2',
          question: 'Which of these is a strong acid?',
          options: ['Acetic acid', 'Hydrochloric acid', 'Citric acid', 'Carbonic acid'],
          correctAnswer: 1,
          explanation: 'Hydrochloric acid (HCl) is a strong acid that completely dissociates in water.'
        },
        {
          id: 'q3',
          question: 'What happens when an acid reacts with a base?',
          options: ['Explosion', 'Neutralization', 'Precipitation', 'No reaction'],
          correctAnswer: 1,
          explanation: 'Acids and bases undergo neutralization, producing salt and water.'
        }
      ]
    }
  },
  {
    id: 'hs-precipitation',
    title: 'Precipitation Reactions',
    gradeLevel: 'high-school',
    subject: 'General Chemistry',
    objectives: [
      'Understand solubility rules',
      'Predict precipitate formation',
      'Write net ionic equations',
      'Identify common precipitates'
    ],
    experiments: ['silver-chloride', 'barium-sulfate', 'copper-hydroxide'],
    duration: 50,
    quiz: {
      id: 'hs-precipitation-quiz',
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'What is a precipitate?',
          options: [
            'A gas that escapes',
            'A solid that forms in solution',
            'A color change',
            'A temperature increase'
          ],
          correctAnswer: 1,
          explanation: 'A precipitate is an insoluble solid that forms when two solutions are mixed.'
        },
        {
          id: 'q2',
          question: 'What color is silver chloride precipitate?',
          options: ['Blue', 'White', 'Red', 'Green'],
          correctAnswer: 1,
          explanation: 'Silver chloride (AgCl) forms a white precipitate.'
        }
      ]
    }
  },
  
  // Undergraduate Level
  {
    id: 'ug-redox',
    title: 'Oxidation-Reduction Reactions',
    gradeLevel: 'undergraduate',
    subject: 'Inorganic Chemistry',
    objectives: [
      'Identify oxidation and reduction',
      'Balance redox equations',
      'Understand electron transfer',
      'Calculate oxidation states'
    ],
    experiments: ['kmno4-oxidation', 'iodine-titration', 'copper-reduction'],
    duration: 60,
    quiz: {
      id: 'ug-redox-quiz',
      passingScore: 75,
      questions: [
        {
          id: 'q1',
          question: 'What is oxidation?',
          options: [
            'Gain of electrons',
            'Loss of electrons',
            'Gain of protons',
            'Loss of neutrons'
          ],
          correctAnswer: 1,
          explanation: 'Oxidation is the loss of electrons, which increases oxidation state.'
        }
      ]
    }
  },
  {
    id: 'ug-complexation',
    title: 'Coordination Chemistry',
    gradeLevel: 'undergraduate',
    subject: 'Inorganic Chemistry',
    objectives: [
      'Understand complex ion formation',
      'Identify ligands',
      'Predict complex colors',
      'Calculate coordination numbers'
    ],
    experiments: ['copper-ammonia', 'iron-thiocyanate', 'nickel-complex'],
    duration: 60,
    quiz: {
      id: 'ug-complexation-quiz',
      passingScore: 75,
      questions: [
        {
          id: 'q1',
          question: 'What is a ligand?',
          options: [
            'A metal ion',
            'An electron donor',
            'A precipitate',
            'An acid'
          ],
          correctAnswer: 1,
          explanation: 'A ligand is a molecule or ion that donates electrons to a metal center.'
        }
      ]
    }
  },
  
  // Graduate Level
  {
    id: 'grad-kinetics',
    title: 'Chemical Kinetics',
    gradeLevel: 'graduate',
    subject: 'Physical Chemistry',
    objectives: [
      'Measure reaction rates',
      'Determine rate laws',
      'Calculate activation energy',
      'Understand catalysis'
    ],
    experiments: ['rate-determination', 'temperature-effect', 'catalyst-study'],
    duration: 90,
    quiz: {
      id: 'grad-kinetics-quiz',
      passingScore: 80,
      questions: [
        {
          id: 'q1',
          question: 'What is the rate-determining step?',
          options: [
            'The fastest step',
            'The slowest step',
            'The first step',
            'The last step'
          ],
          correctAnswer: 1,
          explanation: 'The rate-determining step is the slowest step in a reaction mechanism.'
        }
      ]
    }
  }
]

export function getLessonsByGrade(gradeLevel: string): CurriculumLesson[] {
  return CURRICULUM_LESSONS.filter(lesson => lesson.gradeLevel === gradeLevel)
}

export function getLessonById(id: string): CurriculumLesson | undefined {
  return CURRICULUM_LESSONS.find(lesson => lesson.id === id)
}

export function generateHomework(lessonId: string): any {
  const lesson = getLessonById(lessonId)
  if (!lesson) return null
  
  return {
    lessonId,
    title: `${lesson.title} - Homework Assignment`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tasks: [
      {
        type: 'experiment',
        description: `Complete all experiments in the ${lesson.title} lesson`,
        experiments: lesson.experiments
      },
      {
        type: 'quiz',
        description: 'Complete the lesson quiz with at least 70% score',
        quiz: lesson.quiz
      },
      {
        type: 'report',
        description: 'Write a lab report summarizing your findings',
        minWords: 500
      }
    ]
  }
}

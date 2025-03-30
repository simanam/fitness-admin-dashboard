// src/utils/instructionsParser.ts

/**
 * Parses free-form exercise instructions text into structured form_points
 * This utility extracts setup, execution, breathing, and alignment sections from instructions text.
 */

interface FormPoints {
  setup: string[];
  execution: string[];
  breathing: string[];
  alignment: string[];
}

/**
 * Parse instructions text into structured form_points object
 * @param instructionsText Full instructions text
 * @returns FormPoints object with parsed sections
 */
export const parseInstructions = (instructionsText?: string): FormPoints => {
  // Default empty structure
  const formPoints: FormPoints = {
    setup: [],
    execution: [],
    breathing: [],
    alignment: [],
  };

  if (!instructionsText) return formPoints;

  // Split the text by lines and process
  const lines = instructionsText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let currentSection: keyof FormPoints | null = null;

  // Process each line and categorize into sections
  for (const line of lines) {
    // Check for section headers (case insensitive)
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('setup:')) {
      currentSection = 'setup';
      continue;
    } else if (lowerLine.includes('execution:')) {
      currentSection = 'execution';
      continue;
    } else if (lowerLine.includes('breathing:')) {
      currentSection = 'breathing';
      continue;
    } else if (lowerLine.includes('alignment:')) {
      currentSection = 'alignment';
      continue;
    }

    // If we have a current section and the line isn't empty, add it
    if (currentSection && line) {
      // Remove bullet points or numbers at the beginning
      const cleanedLine = line.replace(/^[\d-•*]+\.?\s*/, '').trim();
      if (cleanedLine) {
        formPoints[currentSection].push(cleanedLine);
      }
    }
  }

  return formPoints;
};

/**
 * Format form_points object back into instructions text
 * @param formPoints FormPoints object
 * @returns Formatted instructions text
 */
export const formatInstructions = (formPoints: FormPoints): string => {
  if (!formPoints) return '';

  const sections: string[] = [];

  // Add each non-empty section
  if (formPoints.setup && formPoints.setup.length > 0) {
    sections.push(
      'Setup:\n' +
        formPoints.setup
          .map((item, index) => `${index + 1}. ${item}`)
          .join('\n')
    );
  }

  if (formPoints.execution && formPoints.execution.length > 0) {
    sections.push(
      'Execution:\n' +
        formPoints.execution
          .map((item, index) => `${index + 1}. ${item}`)
          .join('\n')
    );
  }

  if (formPoints.breathing && formPoints.breathing.length > 0) {
    sections.push(
      'Breathing:\n' +
        formPoints.breathing.map((item) => `- ${item}`).join('\n')
    );
  }

  if (formPoints.alignment && formPoints.alignment.length > 0) {
    sections.push(
      'Alignment:\n' +
        formPoints.alignment.map((item) => `- ${item}`).join('\n')
    );
  }

  return sections.join('\n\n');
};

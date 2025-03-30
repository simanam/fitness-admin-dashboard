// src/utils/formDebug.ts

/**
 * Utility functions for debugging form data
 */

/**
 * Log form data with recursively stringified objects for better inspection
 * @param data Form data to log
 * @param label Optional label for the log
 */
export const logFormData = (data: any, label = 'Form Data') => {
  if (process.env.NODE_ENV === 'development') {
    // Create a deep copy with circular references handled
    const processedData = JSON.parse(JSON.stringify(data, replacer));
    console.group(label);
    console.log(processedData);
    console.groupEnd();
  }
};

/**
 * Replacer function for JSON.stringify that handles circular references
 */
function replacer(key: string, value: any) {
  if (typeof value === 'object' && value !== null) {
    // Check for circular reference
    if (seenObjects.has(value)) {
      return '[Circular]';
    }
    seenObjects.add(value);
  }
  return value;
}

// Set to keep track of seen objects for circular reference detection
const seenObjects = new WeakSet();

/**
 * Validate exercise form data structure
 * @param data Form data to validate
 * @returns Object with validation result and any error messages
 */
export const validateExerciseFormData = (data: any) => {
  const errors: string[] = [];

  // Check for required fields
  const requiredFields = [
    'name',
    'description',
    'difficulty',
    'mechanics',
    'force',
    'movement_pattern',
  ];
  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check form_points structure
  if (!data.form_points) {
    errors.push('Missing form_points object');
  } else {
    const formPointsFields = ['setup', 'execution', 'breathing', 'alignment'];
    formPointsFields.forEach((field) => {
      if (!Array.isArray(data.form_points[field])) {
        errors.push(`form_points.${field} must be an array`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

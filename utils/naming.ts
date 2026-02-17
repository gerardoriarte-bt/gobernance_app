
/**
 * Sanitizes input and converts to PascalCase.
 * Example: "Messi & Friends - 50%" -> "MessiAndFriends50"
 */
export const toPascalCase = (str: string): string => {
  if (!str) return '';
  
  // Replace & with And
  let sanitized = str.replace(/&/g, 'And');
  
  // Normalize accents and remove special characters
  sanitized = sanitized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
  
  // Split into words, capitalize first letters, join
  return sanitized
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * Creates a safe camelCase ID for dictionary keys and structure tokens.
 * Example: "Promoción Especial" -> "promocionEspecial"
 */
export const sanitizeCategoryId = (name: string): string => {
  const pascal = toPascalCase(name);
  if (!pascal) return '';
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * Replaces tokens in a structure with actual values.
 */
export const resolveStructure = (
  structure: string, 
  values: Record<string, string>, 
  parents: Record<string, string> = {},
  options?: { transform?: (val: string) => string }
): string => {
  let result = structure;
  
  // Choose transformation strategy
  const transform = options?.transform || toPascalCase;
  
  // Handle parent tokens first
  Object.entries(parents).forEach(([tokenKey, tokenValue]) => {
    result = result.replace(new RegExp(`\\{${tokenKey}\\}`, 'g'), tokenValue || `[${tokenKey}]`);
  });
  
  // Handle level-specific tokens with sanitization
  Object.entries(values).forEach(([key, val]) => {
    if (result.includes(`{${key}}`)) {
      // Apply transform to the value
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), transform(val) || `[${key}]`);
    }
  });
  
  // Clean up any remaining unresolved tokens
  return result.replace(/\{(\w+)\}/g, '[$1]');
};

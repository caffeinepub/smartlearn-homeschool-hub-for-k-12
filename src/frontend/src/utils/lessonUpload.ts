/**
 * Utility functions for lesson plan file upload
 */

const SUPPORTED_EXTENSIONS = ['.txt', '.md'];

/**
 * Validates if a file has a supported text-based extension
 */
export function isSupportedFileType(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  return SUPPORTED_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Derives a default lesson title from a filename
 * Removes the file extension and cleans up the name
 */
export function deriveDefaultTitle(filename: string): string {
  // Remove extension
  let title = filename.replace(/\.(txt|md)$/i, '');
  
  // Replace underscores and hyphens with spaces
  title = title.replace(/[_-]/g, ' ');
  
  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, char => char.toUpperCase());
  
  return title;
}

/**
 * Reads a text file and returns its content as a string
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Gets a user-friendly error message for unsupported file types
 */
export function getUnsupportedFileTypeError(): string {
  return `Unsupported file type. Please upload a text file (${SUPPORTED_EXTENSIONS.join(', ')})`;
}

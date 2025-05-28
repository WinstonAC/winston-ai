import { CSVRow, LogEntry } from '@/types/agent';
import Papa from 'papaparse';
import { validateEmail } from './email';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 1000;
const REQUIRED_FIELDS = ['name', 'email'];
const OPTIONAL_FIELDS = ['company', 'role'];
const ALLOWED_HEADERS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the structure of CSV headers
 * @param headers Array of header strings from CSV
 * @returns Validation result with errors and warnings
 */
export const validateCSVStructure = (headers: string[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lowercaseHeaders = headers.map(h => h.toLowerCase());

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!lowercaseHeaders.includes(field.toLowerCase())) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check for unknown fields
  headers.forEach(header => {
    if (!ALLOWED_HEADERS.includes(header.toLowerCase())) {
      warnings.push(`Unknown field: ${header}`);
    }
  });

  // Check for duplicate headers
  const duplicates = headers.filter((header, index) => 
    headers.indexOf(header.toLowerCase()) !== index
  );
  if (duplicates.length > 0) {
    errors.push(`Duplicate headers found: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitizes a CSV value to prevent formula injection and escape HTML characters
 * @param value The value to sanitize
 * @returns Sanitized value
 */
export const sanitizeCSVValue = (value: string): string => {
  if (!value) return '';

  // Prevent formula injection
  const formulaStart = ['=', '+', '-', '@', '\t', '\r', '\n'];
  let sanitized = value.trim();
  
  if (formulaStart.some(char => sanitized.startsWith(char))) {
    sanitized = `'${sanitized}`;
  }

  // Remove any null bytes or control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Escape HTML characters
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const sanitizedEmail = sanitizeCSVValue(email);
  return validateEmail(sanitizedEmail);
};

/**
 * Validates a single CSV row
 * @param row The row data to validate
 * @param rowIndex The index of the row in the CSV
 * @returns Validation result
 */
export const validateCSVRow = (
  row: Record<string, string>, 
  rowIndex: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!row.name?.trim()) {
    errors.push(`Row ${rowIndex}: Missing name`);
  }
  if (!row.email?.trim()) {
    errors.push(`Row ${rowIndex}: Missing email`);
  } else if (!isValidEmail(row.email)) {
    errors.push(`Row ${rowIndex}: Invalid email format - ${row.email}`);
  }

  // Validate field lengths
  if (row.name && row.name.length > 100) {
    warnings.push(`Row ${rowIndex}: Name exceeds 100 characters`);
  }
  if (row.company && row.company.length > 200) {
    warnings.push(`Row ${rowIndex}: Company name exceeds 200 characters`);
  }
  if (row.role && row.role.length > 100) {
    warnings.push(`Row ${rowIndex}: Role exceeds 100 characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Parses a CSV file and validates its contents
 * @param file File object containing CSV data
 * @param onProgress Optional callback for progress updates
 * @param onLog Optional callback for logging events
 * @returns Promise resolving to parsed rows and validation results
 */
export const parseCSV = async (
  file: File,
  onProgress?: (progress: number) => void,
  onLog?: (log: LogEntry) => void
): Promise<{ 
  rows: CSVRow[]; 
  errors: string[]; 
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`));
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const rows: CSVRow[] = [];
    let headerValidated = false;
    let rowCount = 0;
    let validRowCount = 0;
    let invalidRowCount = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => sanitizeCSVValue(value),
      step: (results, parser) => {
        rowCount++;

        // Check max rows limit
        if (rowCount > MAX_ROWS) {
          parser.abort();
          errors.push(`File exceeds maximum limit of ${MAX_ROWS} rows`);
          return;
        }

        // Validate headers on first row
        if (!headerValidated) {
          const data = results.data as Record<string, string>;
          const headers = Object.keys(data);
          const { isValid, errors: headerErrors, warnings: headerWarnings } = validateCSVStructure(headers);
          if (!isValid) {
            errors.push(...headerErrors);
            parser.abort();
            return;
          }
          warnings.push(...headerWarnings);
          headerValidated = true;
        }

        const row = results.data as Record<string, string>;
        
        // Validate row
        const { isValid, errors: rowErrors, warnings: rowWarnings } = validateCSVRow(row, rowCount);
        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
          invalidRowCount++;
        }
        if (rowWarnings.length > 0) {
          warnings.push(...rowWarnings);
        }

        // Add valid row to results
        if (isValid) {
          rows.push(row as CSVRow);
          validRowCount++;
        }

        // Update progress
        if (onProgress) {
          onProgress((rowCount / MAX_ROWS) * 100); // Approximate progress
        }

        // Log progress
        if (onLog && rowCount % 100 === 0) {
          onLog({
            message: `Processed ${rowCount} rows...`,
            timestamp: new Date().toISOString(),
            type: 'info',
            rowNumber: rowCount
          });
        }
      },
      complete: () => {
        resolve({ 
          rows, 
          errors, 
          warnings,
          stats: {
            totalRows: rowCount,
            validRows: validRowCount,
            invalidRows: invalidRowCount
          }
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}; 
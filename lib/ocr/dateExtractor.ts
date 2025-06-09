import * as Tesseract from 'tesseract.js';

export interface DateInfo {
  year: number;
  month: number;
  day: number;
}

export interface ExtractionResult {
  success: boolean;
  dateInfo?: DateInfo;
  error?: string;
}

// Common date format patterns to extract from ID cards
const datePatterns = [
  // MM/DD/YYYY
  /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  // DD/MM/YYYY
  /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  // YYYY/MM/DD
  /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
  // MM-DD-YYYY
  /(\d{1,2})-(\d{1,2})-(\d{4})/,
  // DD-MM-YYYY
  /(\d{1,2})-(\d{1,2})-(\d{4})/,
  // YYYY-MM-DD
  /(\d{4})-(\d{1,2})-(\d{1,2})/,
  // Long format dates (e.g., "January 1, 1990")
  /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i,
  // DOB: specific pattern
  /DOB:?\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i,
  /Date\s+of\s+Birth:?\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i,
  /Birth\s+Date:?\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/i
];

const monthNameToNumber: Record<string, number> = {
  'january': 1, 'jan': 1,
  'february': 2, 'feb': 2,
  'march': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'may': 5,
  'june': 6, 'jun': 6,
  'july': 7, 'jul': 7,
  'august': 8, 'aug': 8,
  'september': 9, 'sep': 9,
  'october': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'december': 12, 'dec': 12
};

export const extractDateFromText = (text: string): ExtractionResult => {
  try {
    for (const pattern of datePatterns) {
      const match = text.match(pattern);

      if (match) {
        // Handle different patterns
        if (match.length >= 4) {
          let day, month, year;

          // Check if we have a month name
          if (isNaN(Number(match[1])) && match[1].length > 2) {
            // This is likely a month name
            const monthName = match[1].toLowerCase();
            month = monthNameToNumber[monthName] || 0;
            day = parseInt(match[2], 10);
            year = parseInt(match[3], 10);
          } else if (match[0].includes('/') || match[0].includes('-')) {
            // For numeric patterns, we need to handle different date formats
            const parts = [match[1], match[2], match[3]].map(p => parseInt(p, 10));
            
            // If first number is clearly a year (4 digits)
            if (parts[0] > 1000) {
              year = parts[0];
              month = parts[1];
              day = parts[2];
            } 
            // If last number is clearly a year (4 digits)
            else if (parts[2] > 1000) {
              year = parts[2];
              
              // Determine if MM/DD or DD/MM format - we'll assume MM/DD is more common in US IDs
              month = parts[0];
              day = parts[1];
              
              // Validate month/day
              if (month > 12) {
                // Swap if month is invalid
                const temp = month;
                month = day;
                day = temp;
              }
            } else {
              // Can't determine reliably
              continue;
            }
          } else {
            continue; // Skip if we can't determine format
          }

          // Validate the date components
          if (month >= 1 && month <= 12 && 
              day >= 1 && day <= 31 && 
              year >= 1900 && year <= new Date().getFullYear()) {
            return {
              success: true,
              dateInfo: { year, month, day }
            };
          }
        }
      }
    }

    return { 
      success: false, 
      error: "Could not find a valid date pattern in the text." 
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

export const extractDateFromImage = async (imageFile: File): Promise<ExtractionResult> => {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      { logger: m => console.log(m) }
    );

    const extractedText = result.data.text;
    return extractDateFromText(extractedText);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "OCR processing failed"
    };
  }
};
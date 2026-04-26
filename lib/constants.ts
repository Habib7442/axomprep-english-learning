export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ACCEPTED_PDF_TYPES = ['application/pdf'];

export const TIER_LIMITS = {
  free: {
    maxPages: 100,
    maxOCR: 20,
    maxPDFs: 3
  },
  student: {
    maxPages: 300,
    maxOCR: 50,
    maxPDFs: 20
  },
  pro: {
    maxPages: 1000,
    maxOCR: 150,
    maxPDFs: 1000
  }
} as const;

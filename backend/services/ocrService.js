import fetch from 'node-fetch';

class OCRService {
  constructor() {
    // OCR.space API endpoint
    this.apiUrl = 'https://api.ocr.space/parse/image';
    this.apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';
  }

  /**
   * Extract text from image or PDF using OCR.space API
   * @param {Buffer} fileBuffer - The file buffer to process
   * @param {string} mimeType - The MIME type of the file
   * @param {Object} options - OCR options
   * @returns {Promise<string>} - Extracted text
   */
  async extractTextFromFile(fileBuffer, mimeType, options = {}) {
    try {
      console.log('Starting OCR text extraction with OCR.space API...');
      console.log('File type:', mimeType);
      
      // Default options
      const defaultOptions = {
        language: 'eng', // English
        isOverlayRequired: false, // We only need the text
        detectOrientation: true, // Auto-rotate if needed
        scale: true, // Improve OCR for low-resolution images
        OCREngine: 2, // Engine 2 for better text recognition
        filetype: this.getFileType(mimeType)
      };

      const ocrOptions = { ...defaultOptions, ...options };

      // Convert buffer to base64
      const base64String = fileBuffer.toString('base64');
      const base64Data = `data:${mimeType};base64,${base64String}`;

      // Prepare request body as URL-encoded form data
      const formParams = new URLSearchParams();
      formParams.append('base64Image', base64Data);
      formParams.append('language', ocrOptions.language);
      formParams.append('isOverlayRequired', ocrOptions.isOverlayRequired.toString());
      formParams.append('detectOrientation', ocrOptions.detectOrientation.toString());
      formParams.append('scale', ocrOptions.scale.toString());
      formParams.append('OCREngine', ocrOptions.OCREngine.toString());
      
      if (ocrOptions.filetype) {
        formParams.append('filetype', ocrOptions.filetype);
      }

      console.log('Sending request to OCR.space API...');

      // Make API request
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formParams.toString(),
      });

      if (!response.ok) {
        throw new Error(`OCR API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('OCR API response received');

      // Check for API errors
      if (result.IsErroredOnProcessing) {
        throw new Error(`OCR processing error: ${result.ErrorMessage || 'Unknown error'}`);
      }

      // Extract text from all parsed results
      let extractedText = '';
      
      if (result.ParsedResults && result.ParsedResults.length > 0) {
        for (let i = 0; i < result.ParsedResults.length; i++) {
          const parsedResult = result.ParsedResults[i];
          
          if (parsedResult.FileParseExitCode === 1) {
            // Success
            if (parsedResult.ParsedText) {
              extractedText += parsedResult.ParsedText;
              
              // Add page separator for multi-page documents
              if (result.ParsedResults.length > 1) {
                extractedText += `\n\n--- Page ${i + 1} ---\n\n`;
              }
            }
          } else {
            // Error parsing this page/file
            console.warn(`Failed to parse page ${i + 1}:`, parsedResult.ErrorMessage);
          }
        }
      }

      // Clean up the extracted text
      const cleanedText = extractedText
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
        .trim(); // Remove leading/trailing whitespace

      console.log('OCR text extraction completed successfully');
      console.log(`Extracted ${cleanedText.length} characters`);

      return cleanedText || 'No text could be extracted from this document.';

    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Get file type string for OCR.space API
   * @param {string} mimeType - MIME type
   * @returns {string} - File type for API
   */
  getFileType(mimeType) {
    const typeMap = {
      'image/jpeg': 'JPG',
      'image/jpg': 'JPG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'image/bmp': 'BMP',
      'image/tiff': 'TIF',
      'image/tif': 'TIF',
      'application/pdf': 'PDF'
    };

    return typeMap[mimeType.toLowerCase()] || null;
  }

  /**
   * Get supported file types
   * @returns {Array<string>} - Array of supported MIME types
   */
  getSupportedTypes() {
    return [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/tif',
      'application/pdf'
    ];
  }

  /**
   * Check if file type is supported
   * @param {string} mimeType - MIME type to check
   * @returns {boolean} - Whether the type is supported
   */
  isSupported(mimeType) {
    return this.getSupportedTypes().includes(mimeType.toLowerCase());
  }
}

// Export singleton instance
const ocrService = new OCRService();
export default ocrService;

import pdf from 'pdf-parse';
import fs from 'fs';

export async function processPDF(filePath: string): Promise<string> {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF
    const data = await pdf(dataBuffer);
    
    // Extract text content
    const text = data.text;
    
    // Clean up the text
    const cleanedText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    console.log(`✅ PDF processed successfully: ${filePath}`);
    console.log(`📄 Extracted ${cleanedText.length} characters`);
    
    return cleanedText;
  } catch (error) {
    console.error('❌ PDF processing error:', error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractPDFMetadata(filePath: string): Promise<any> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    return {
      pageCount: data.numpages,
      info: data.info,
      metadata: data.metadata,
      version: data.version
    };
  } catch (error) {
    console.error('❌ PDF metadata extraction error:', error);
    throw new Error(`Failed to extract PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 
import fs from 'fs/promises';
import path from 'path';
import { createDocumentChunks, generateEmbedding } from './embeddings';
import { VectorDocument } from './vector-store';

export interface KMADocument {
  filename: string;
  title: string;
  content: string;
  metadata: {
    alertType?: string;
    severity?: string;
    system?: string;
    alertDuration?: string;
    scope?: string;
  };
}

export interface ProcessedDocument {
  document: KMADocument;
  chunks: VectorDocument[];
}

function extractMetadataFromContent(content: string): KMADocument['metadata'] {
  const metadata: KMADocument['metadata'] = {};

  // Extract system information
  const systemMatch = content.match(/\*\*System\*\*:\s*(.+)/);
  if (systemMatch) {
    metadata.system = systemMatch[1].trim();
  }

  // Extract severity
  const severityMatch = content.match(/\*\*Severity\*\*:\s*(.+)/);
  if (severityMatch) {
    metadata.severity = severityMatch[1].trim();
  }

  // Extract alert duration
  const durationMatch = content.match(/\*\*Alert Duration\*\*:\s*(.+)/);
  if (durationMatch) {
    metadata.alertDuration = durationMatch[1].trim();
  }

  // Extract scope
  const scopeMatch = content.match(/\*\*Scope\*\*:\s*(.+)/);
  if (scopeMatch) {
    metadata.scope = scopeMatch[1].trim();
  }

  return metadata;
}

function extractTitleFromContent(content: string, filename: string): string {
  // Try to extract the first H1 header
  const h1Match = content.match(/^#\s+(.+)/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Fallback: create title from filename
  return filename
    .replace(/\.md$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function extractAlertType(filename: string, content: string): string {
  // Extract alert type from filename pattern
  const filenameParts = filename.replace(/\.md$/, '').split('_');

  if (filenameParts.length > 2) {
    // Skip the first part (likely a number) and join the rest
    return filenameParts.slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Fallback: try to extract from content
  const titleMatch = content.match(/^#\s+(.+)/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  return 'Unknown Alert Type';
}

export async function loadKMADocument(filePath: string): Promise<KMADocument> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const filename = path.basename(filePath);

    const title = extractTitleFromContent(content, filename);
    const alertType = extractAlertType(filename, content);
    const metadata = extractMetadataFromContent(content);
    metadata.alertType = alertType;

    return {
      filename,
      title,
      content,
      metadata,
    };
  } catch (error) {
    console.error(`Error loading KMA document ${filePath}:`, error);
    throw error;
  }
}

export async function processKMADocument(document: KMADocument): Promise<ProcessedDocument> {
  try {
    // Create chunks from the document content
    const documentChunks = createDocumentChunks(
      document.content,
      document.filename,
      document.title
    );

    // Generate embeddings for each chunk
    const vectorDocuments: VectorDocument[] = [];

    for (const chunk of documentChunks) {
      const embedding = await generateEmbedding(chunk.content);

      vectorDocuments.push({
        id: chunk.id,
        values: embedding,
        metadata: {
          filename: chunk.metadata.filename,
          title: chunk.metadata.title,
          content: chunk.content,
          section: chunk.metadata.section,
          chunkIndex: chunk.metadata.chunkIndex,
          totalChunks: chunk.metadata.totalChunks,
        },
      });
    }

    return {
      document,
      chunks: vectorDocuments,
    };
  } catch (error) {
    console.error(`Error processing KMA document ${document.filename}:`, error);
    throw error;
  }
}

export async function loadAllKMADocuments(kmaDir: string = 'public/docs/kma'): Promise<KMADocument[]> {
  try {
    const documents: KMADocument[] = [];
    const files = await fs.readdir(kmaDir);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(kmaDir, file);
        const document = await loadKMADocument(filePath);
        documents.push(document);
      }
    }

    return documents;
  } catch (error) {
    console.error('Error loading KMA documents:', error);
    throw error;
  }
}

export async function processAllKMADocuments(kmaDir: string = 'public/docs/kma'): Promise<ProcessedDocument[]> {
  try {
    const documents = await loadAllKMADocuments(kmaDir);
    const processedDocuments: ProcessedDocument[] = [];

    for (const document of documents) {
      const processed = await processKMADocument(document);
      processedDocuments.push(processed);
    }

    return processedDocuments;
  } catch (error) {
    console.error('Error processing all KMA documents:', error);
    throw error;
  }
}

export function formatDocumentForRAG(
  searchResults: Array<{
    metadata: {
      filename: string;
      title: string;
      content: string;
      section?: string;
    };
    score: number;
  }>
): string {
  if (searchResults.length === 0) {
    return '';
  }

  let formattedContext = 'Based on the following incident response documentation:\n\n';

  searchResults.forEach((result, index) => {
    const { metadata } = result;
    formattedContext += `## Document ${index + 1}: ${metadata.title}\n`;
    if (metadata.section) {
      formattedContext += `### ${metadata.section}\n`;
    }
    formattedContext += `${metadata.content}\n\n`;
    formattedContext += `*Source: ${metadata.filename}*\n\n`;
  });

  return formattedContext;
}
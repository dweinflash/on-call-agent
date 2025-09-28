/**
 * Embedding generation utilities for the RAG system.
 * Uses deterministic hash-based embeddings for consistent vector representations.
 * Provides document chunking and processing capabilities for KMA documents.
 */

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Generate a deterministic hash-based embedding for consistent results
    const hash = simpleHash(text);
    const embedding = [];

    // Generate 384-dimensional embedding to match standard embedding models
    for (let i = 0; i < 384; i++) {
      const seed = hash + i;
      embedding.push((Math.sin(seed) + 1) / 2); // Normalize to 0-1 range
    }

    console.log(`Generated embedding for: "${text.substring(0, 50)}..."`);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  const words = text.split(' ');

  if (words.length <= chunkSize) {
    return [text];
  }

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);

    if (i + chunkSize >= words.length) {
      break;
    }
  }

  return chunks;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    filename: string;
    title: string;
    section?: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

export function createDocumentChunks(
  content: string,
  filename: string,
  title: string
): DocumentChunk[] {
  // Split by markdown headers to maintain semantic boundaries
  const sections = content.split(/(?=^#{1,3}\s)/m);
  const chunks: DocumentChunk[] = [];

  sections.forEach((section, sectionIndex) => {
    const sectionMatch = section.match(/^(#{1,3})\s+(.+)/m);
    const sectionTitle = sectionMatch ? sectionMatch[2].trim() : undefined;

    // Chunk each section if it's too long
    const textChunks = chunkText(section.trim(), 500, 50);

    textChunks.forEach((chunk, chunkIndex) => {
      if (chunk.trim().length > 0) {
        chunks.push({
          id: `${filename}_${sectionIndex}_${chunkIndex}`,
          content: chunk,
          metadata: {
            filename,
            title,
            section: sectionTitle,
            chunkIndex: chunks.length,
            totalChunks: 0, // Will be updated after all chunks are created
          }
        });
      }
    });
  });

  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });

  return chunks;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
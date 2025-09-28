/**
 * Pinecone Vector Store Implementation
 *
 * Provides vector storage and similarity search capabilities using Pinecone's
 * managed vector database service. Handles document indexing, search, and
 * management operations for the RAG system.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from './embeddings';

export interface VectorDocument {
  id: string;
  values: number[];
  metadata: {
    filename: string;
    title: string;
    content: string;
    section?: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    filename: string;
    title: string;
    content: string;
    section?: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

let pinecone: Pinecone | null = null;
let index: any = null;

const INDEX_NAME = 'kma-documents';

function getPinecone(): Pinecone {
  if (!pinecone) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is not set');
    }

    pinecone = new Pinecone({
      apiKey: apiKey,
    });
    console.log('Pinecone client initialized');
  }
  return pinecone;
}

async function getIndex() {
  if (!index) {
    const pc = getPinecone();
    index = pc.index(INDEX_NAME);
    console.log(`Connected to Pinecone index: ${INDEX_NAME}`);
  }
  return index;
}

/**
 * Initializes the Pinecone index for storing document vectors.
 * Creates the index if it doesn't exist and waits for it to be ready.
 */
export async function initializeIndex(): Promise<void> {
  try {
    const pc = getPinecone();

    // Check if index exists
    const indexList = await pc.listIndexes();
    const indexExists = indexList.indexes?.some(idx => idx.name === INDEX_NAME);

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${INDEX_NAME}`);
      await pc.createIndex({
        name: INDEX_NAME,
        dimension: 1536, // Matches OpenAI text-embedding-3-small dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });

      // Wait for index to be ready
      console.log('Waiting for index to be ready...');
      let ready = false;
      while (!ready) {
        try {
          const indexDescription = await pc.describeIndex(INDEX_NAME);
          ready = indexDescription.status?.ready === true;
          if (!ready) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.log('Index not ready yet, waiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Get the index reference
    await getIndex();
    console.log('Pinecone index initialized successfully');
  } catch (error) {
    console.error('Error initializing Pinecone index:', error);
    throw error;
  }
}

/**
 * Upserts document vectors to the Pinecone index.
 * Uploads documents in batches to respect Pinecone's API limits.
 *
 * @param documents - Array of vector documents to upsert
 */
export async function upsertDocuments(documents: VectorDocument[]): Promise<void> {
  try {
    const idx = await getIndex();

    // Convert documents to Pinecone format
    const vectors = documents.map(doc => ({
      id: doc.id,
      values: doc.values,
      metadata: {
        filename: doc.metadata.filename,
        title: doc.metadata.title,
        content: doc.metadata.content,
        section: doc.metadata.section || '',
        chunkIndex: doc.metadata.chunkIndex,
        totalChunks: doc.metadata.totalChunks,
      }
    }));

    // Upsert in batches of 100 (Pinecone limit)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await idx.upsert(batch);
      console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }

    console.log(`Successfully upserted ${documents.length} documents to Pinecone`);
  } catch (error) {
    console.error('Error upserting documents to Pinecone:', error);
    throw error;
  }
}

/**
 * Searches for similar documents using vector similarity.
 * Generates an embedding for the query and finds the most similar documents.
 *
 * @param query - The text query to search for
 * @param topK - Maximum number of results to return (default: 5)
 * @param filter - Optional metadata filter for results
 * @returns Array of search results with similarity scores
 */
export async function searchSimilar(
  query: string,
  topK: number = 5,
  filter?: Record<string, any>
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    const idx = await getIndex();

    // Search in Pinecone
    const searchResponse = await idx.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      filter: filter
    });

    // Convert Pinecone response to our format
    const results: SearchResult[] = searchResponse.matches?.map(match => ({
      id: match.id || '',
      score: match.score || 0,
      metadata: {
        filename: match.metadata?.filename as string || '',
        title: match.metadata?.title as string || '',
        content: match.metadata?.content as string || '',
        section: match.metadata?.section as string || undefined,
        chunkIndex: match.metadata?.chunkIndex as number || 0,
        totalChunks: match.metadata?.totalChunks as number || 0,
      }
    })) || [];

    console.log(`Found ${results.length} similar documents for query: "${query.substring(0, 50)}..."`);
    return results;
  } catch (error) {
    console.error('Error searching in Pinecone:', error);
    throw error;
  }
}

export async function deleteAllDocuments(): Promise<void> {
  try {
    const idx = await getIndex();

    // Check if there are any vectors to delete first
    const stats = await idx.describeIndexStats();
    const totalVectorCount = stats.totalVectorCount || 0;

    if (totalVectorCount > 0) {
      // Delete all vectors in the index
      await idx.deleteAll();
      console.log('All documents deleted from Pinecone');
    } else {
      console.log('No documents to delete from Pinecone (index is empty)');
    }
  } catch (error) {
    // Handle 404 errors for empty indexes gracefully
    if (error && typeof error === 'object' && 'message' in error &&
        error.message.includes('404')) {
      console.log('Index is empty, no documents to delete');
      return;
    }
    console.error('Error deleting all documents from Pinecone:', error);
    throw error;
  }
}

export async function deleteDocumentsByFilename(filename: string): Promise<void> {
  try {
    const idx = await getIndex();

    // Delete vectors with matching filename
    await idx.deleteMany({
      filter: {
        filename: { $eq: filename }
      }
    });

    console.log(`Deleted documents with filename: ${filename}`);
  } catch (error) {
    console.error('Error deleting documents by filename from Pinecone:', error);
    throw error;
  }
}

export async function deleteIndex(): Promise<void> {
  try {
    const pc = getPinecone();

    // Check if index exists first
    const indexList = await pc.listIndexes();
    const indexExists = indexList.indexes?.some(idx => idx.name === INDEX_NAME);

    if (indexExists) {
      console.log(`Deleting Pinecone index: ${INDEX_NAME}`);
      await pc.deleteIndex(INDEX_NAME);
      console.log('Index deleted successfully');

      // Reset local references
      index = null;
    } else {
      console.log('Index does not exist, nothing to delete');
    }
  } catch (error) {
    console.error('Error deleting Pinecone index:', error);
    throw error;
  }
}

// Utility function for cleanup (not needed for Pinecone)
export function closeDatabase(): void {
  console.log('Pinecone - no connection to close');
}
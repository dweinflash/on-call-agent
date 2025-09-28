import { NextRequest, NextResponse } from 'next/server';
import { processAllKMADocuments } from '@/lib/document-processor';
import { initializeIndex, upsertDocuments, deleteAllDocuments, deleteIndex } from '@/lib/vector-store';

export async function POST(request: NextRequest) {
  try {
    const { reindex = false, forceRecreate = false } = await request.json();

    console.log('Starting document indexing process...');

    // If forceRecreate is true, delete and recreate the entire index
    if (forceRecreate) {
      console.log('Force recreating index...');
      await deleteIndex();
    }

    // Initialize Pinecone index (this will create with correct dimensions)
    await initializeIndex();
    console.log('Pinecone index initialized');

    // If reindex is true, delete all existing documents
    if (reindex && !forceRecreate) {
      console.log('Deleting existing documents...');
      await deleteAllDocuments();
    }

    // Process all KMA documents
    console.log('Processing KMA documents...');
    const processedDocuments = await processAllKMADocuments();

    // Collect all chunks for upserting
    const allChunks = processedDocuments.flatMap(doc => doc.chunks);

    // Upsert chunks to Pinecone
    console.log(`Upserting ${allChunks.length} document chunks...`);
    await upsertDocuments(allChunks);

    const documentStats = {
      totalDocuments: processedDocuments.length,
      totalChunks: allChunks.length,
      documents: processedDocuments.map(doc => ({
        filename: doc.document.filename,
        title: doc.document.title,
        alertType: doc.document.metadata.alertType,
        chunks: doc.chunks.length,
      })),
    };

    console.log('Document indexing completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Documents indexed successfully',
      stats: documentStats,
    });
  } catch (error) {
    console.error('Error indexing documents:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to index documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return indexing status or basic info
    return NextResponse.json({
      endpoint: 'Document Indexing API',
      description: 'Use POST to index KMA documents to vector database',
      usage: {
        reindex: 'Set to true to delete existing documents before indexing',
      },
    });
  } catch (error) {
    console.error('Error in indexing endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { searchSimilar } from '@/lib/vector-store';
import { formatDocumentForRAG } from '@/lib/document-processor';
import { RAG_INSTRUCTIONS, SYSTEM_PROMPT } from './prompt';

// Minimum similarity threshold for including sources
// Scores below this indicate the query is not relevant to the knowledge base
const SIMILARITY_THRESHOLD = 0.5;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let context = '';
    let sources: Array<{ filename: string; title: string; section?: string }> = [];

    try {
      // Search for relevant documents in the knowledge base
      // Get multiple candidates for filtering
      const searchResults = await searchSimilar(message, 2);

      // Filter results by similarity threshold
      const relevantResults = searchResults.filter(result =>
        result.score >= SIMILARITY_THRESHOLD
      );

      if (relevantResults.length > 0) {
        // Format the relevant search results as context
        context = formatDocumentForRAG(relevantResults);

        // Extract source information for citations
        sources = relevantResults.map(result => ({
          filename: result.metadata.filename,
          title: result.metadata.title,
          section: result.metadata.section,
        }));

        console.log(`Found ${relevantResults.length} relevant documents (scores: ${relevantResults.map(r => r.score.toFixed(3)).join(', ')})`);
      } else if (searchResults.length > 0) {
        console.log(`No relevant documents found - highest score: ${Math.max(...searchResults.map(r => r.score)).toFixed(3)} (threshold: ${SIMILARITY_THRESHOLD})`);
      }
    } catch (searchError) {
      console.warn('Failed to search knowledge base:', searchError);
      // Continue without RAG context if search fails
    }

    // Construct the enhanced prompt with context
    const enhancedPrompt = context 
      ? createPromptWithContext(context, message)
      : createPromptWithoutContext(message);

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: enhancedPrompt,
    });

    return NextResponse.json({
      response: text,
      sources: sources.length > 0 ? sources : undefined,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Helper function to create prompt with context
function createPromptWithContext(context: string, message: string): string {
  const userQuestionPrefix = 'User Question:';
  
  return [
    SYSTEM_PROMPT,
    '',
    context,
    '',
    `${userQuestionPrefix} ${message}`,
    '',
    RAG_INSTRUCTIONS
  ].join('\n');
}

// Helper function to create prompt without context
function createPromptWithoutContext(message: string): string {
  const userQuestionPrefix = 'User Question:';
  const instructions = 'Note: No relevant incident response procedures were found in the knowledge base. Please provide general assistance.';
  
  return [
    SYSTEM_PROMPT,
    '',
    `${userQuestionPrefix} ${message}`,
    '',
    instructions
  ].join('\n');
}
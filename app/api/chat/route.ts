import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { searchSimilar } from '@/lib/vector-store';
import { formatDocumentForRAG } from '@/lib/document-processor';
import { RAG_INSTRUCTIONS, SYSTEM_PROMPT } from './prompt';

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
      const searchResults = await searchSimilar(message, 1);

      if (searchResults.length > 0) {
        // Format the search results as context
        context = formatDocumentForRAG(searchResults);

        // Extract source information for citations
        sources = searchResults.map(result => ({
          filename: result.metadata.filename,
          title: result.metadata.title,
          section: result.metadata.section,
        }));
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
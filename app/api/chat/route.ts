import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { searchSimilar } from '@/lib/vector-store';
import { formatDocumentForRAG } from '@/lib/document-processor';

const SYSTEM_PROMPT = `You are an on-call incident response assistant with access to a knowledge base of incident response procedures (KMAs - Knowledge Management Articles). Your role is to help engineers resolve system incidents by providing accurate, step-by-step guidance based on documented procedures.

When responding to incident-related queries:
1. Always search your knowledge base first for relevant incident response procedures
2. Provide specific, actionable steps from the documented procedures
3. Include relevant system information (severity levels, alert thresholds, etc.)
4. Reference the source documents for verification
5. If no relevant documentation is found, clearly state this and provide general guidance

Be concise, accurate, and focus on getting incidents resolved quickly. Always prioritize safety and following established procedures.`;

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
      const searchResults = await searchSimilar(message, 5);

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
      ? `${SYSTEM_PROMPT}

${context}

User Question: ${message}

Please provide a helpful response based on the above documentation. If the documentation is relevant, reference it in your answer. If not relevant, provide general assistance but mention that no specific incident procedures were found.`
      : `${SYSTEM_PROMPT}

User Question: ${message}

Note: No relevant incident response procedures were found in the knowledge base. Please provide general assistance.`;

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
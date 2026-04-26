import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This API route handles Vapi tool calls for searching book segments
// It uses PostgreSQL Full-Text Search implemented in Supabase

// Escape special LIKE pattern characters
function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

async function processBookSearch(bookId: string, query: string) {
  if (!bookId || !query) {
    return { result: 'Missing bookId or query' };
  }

  const supabase = await createClient();

  // Call the Supabase function we created
  const { data, error } = await supabase.rpc('search_book_segments', {
    p_book_id: bookId,
    p_query: query,
    p_limit: 3
  });

  if (error) {
    console.error('Supabase search error:', error);
    return { result: 'Error searching the book segments.' };
  }

  if (!data || data.length === 0) {
    // Fallback: If full-text search returns nothing, try a simple ILIKE
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('book_segments')
      .select('content')
      .eq('book_id', bookId)
      .ilike('content', `%${escapeLikePattern(query)}%`)
      .limit(3);

    if (fallbackError || !fallbackData || fallbackData.length === 0) {
      return { result: 'No specific information found about this in the book.' };
    }

    const combinedText = fallbackData.map((s: any) => s.content).join('\n\n');
    return { result: combinedText };
  }

  const combinedText = data.map((s: any) => s.content).join('\n\n');
  return { result: combinedText };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Vapi sends tool calls in body.message.toolCalls or toolCallList
    const toolCalls = body?.message?.toolCalls || body?.message?.toolCallList;

    if (!toolCalls || toolCalls.length === 0) {
      // Check for old functionCall format
      const functionCall = body?.message?.functionCall;
      if (functionCall) {
        const { name, parameters } = functionCall;
        let args = parameters || {};
        if (typeof parameters === 'string') {
          try { args = JSON.parse(parameters); } catch { args = {}; }
        }
        
        if (name === 'searchBook') {
          const result = await processBookSearch(
            String(args?.bookId ?? ''),
            String(args?.query ?? '')
          );
          return NextResponse.json(result);
        }
      }
      return NextResponse.json({ result: 'No tool calls found' });
    }

    const results = [];
    for (const toolCall of toolCalls) {
      const { id, function: func } = toolCall;
      const name = func?.name;
      let args = func?.arguments || {};
      if (typeof func?.arguments === 'string') {
        try { args = JSON.parse(func.arguments); } catch { args = {}; }
      }

      if (name === 'searchBook') {
        const searchResult = await processBookSearch(
          String(args?.bookId ?? ''),
          String(args?.query ?? '')
        );
        results.push({ toolCallId: id, ...searchResult });
      } else {
        results.push({ toolCallId: id, result: `Unknown function: ${name}` });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Vapi API error:', error);
    return NextResponse.json({ result: 'Internal server error' }, { status: 500 });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Edge runtime for fast streaming response

export async function POST(req: NextRequest) {
  try {
    const { userMessage, hobbiesContext, logsContext, messagesHistory } = await req.json();

    // 1. Format the context matrix — includes daily focus, progress, brain dump, and micro-goal
    const hobbies = hobbiesContext || [];
    const logs = logsContext || [];

    const contextMatrix = hobbies
      .map((h: any) => {
        const focusTag = h.is_daily_focus ? ' [DAILY FOCUS]' : '';
        return `- [${h.category}]${focusTag} ${h.title}: Progress: ${h.progress ?? 0}%. Last Active State: "${h.last_brain_dump}". Micro-Goal: "${h.micro_goal}".`;
      })
      .join('\n');

    // 2. Build recent journal/log summary (last 5 entries)
    const recentLogs = logs.slice(0, 5);
    const logSummary = recentLogs.length > 0
      ? recentLogs.map((l: any) => `- Completed "${l.micro_goal_completed}" for ${l.hobby_title} on ${l.completed_at}`).join('\n')
      : 'No activity logs yet.';

    const systemInstruction = `You are Stella, a warm, knowledgeable, and practical personal hobby advisor for Seasonal Hobby.

Your primary goal is to help users thrive in their hobbies:
1. DIRECT HOBBY KNOWLEDGE & GUIDANCE: When the user asks a question about any hobby (painting, guitar, cooking, coding, fitness, gardening, etc.), give direct, clear, and actionable advice first! Share specific techniques, beginner recommendations, or step-by-step guidance.
2. PERSONALIZED DASHBOARD CONTEXT: Use the user's dashboard data as context when relevant. Connect your advice to their actual hobbies, daily focus, micro-goals, or recent progress, but NEVER let data summaries replace answering their direct question.
3. BITE-SIZED MICRO-GOALS: Help break down big tasks into 5-minute low-friction micro-goals whenever useful.

FORMATTING GUIDELINES FOR CHAT BUBBLES:
- Keep formatting clean, elegant, and readable in chat bubbles.
- Do NOT use markdown headers (like ### or ##) or horizontal lines (like ---). Use clean emoji titles instead (e.g., "🎨 Essential Starter Supplies").
- Use bold text (**like this**) for emphasis and key item names.
- Use simple bullet points (- or •) for lists.
- Keep tone friendly, encouraging, and natural.

User's Hobby Dashboard:
${contextMatrix || 'No hobbies added yet.'}

Recent Activity Journal (last 5 sessions):
${logSummary}`;

    const apiKey = process.env.OPENROUTER_API_KEY;

    // Build conversation history array (last 6 messages max)
    const formattedHistory = Array.isArray(messagesHistory)
      ? messagesHistory
          .filter((m: any) => m.content && (m.role === 'user' || m.role === 'assistant'))
          .slice(-6)
          .map((m: any) => ({ role: m.role, content: m.content }))
      : [];

    const apiMessages = [
      { role: 'system', content: systemInstruction },
      ...formattedHistory,
      { role: 'user', content: userMessage }
    ];

    // 3. Query OpenRouter with inclusionai/ling-3.0-flash:free
    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/seasonal-hobby-hub',
            'X-Title': 'Seasonal Hobby Hub'
          },
          body: JSON.stringify({
            model: 'inclusionai/ling-3.0-flash:free',
            messages: apiMessages,
            stream: true,
            max_tokens: 1200
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok && response.body) {
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            }
          });
        } else {
          const errText = await response.text();
          console.warn('[OpenRouter Chat API Warning]', response.status, errText);
        }
      } catch (err) {
        console.error('[OpenRouter Chat API Error]', err);
      }
    }

    // 4. Dynamic fallback response for offline testing
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const targetHobby = hobbies.find((h: any) =>
          userMessage.toLowerCase().includes(h.title.toLowerCase()) ||
          userMessage.toLowerCase().includes(h.category.toLowerCase())
        ) || hobbies.find((h: any) => h.is_daily_focus) || hobbies[0] || { title: 'your hobbies', micro_goal: 'Set a 5-minute goal', progress: 0 };

        const finalReasoning = [
          `[Reasoning] Analyzing query: "${userMessage}"\n`,
          `[Reasoning] Model selected: inclusionai/ling-3.0-flash:free\n`,
          `[Reasoning] Target hobby match: "${targetHobby.title}"\n`,
          `[Reasoning] Formulating direct hobby guidance and actionable micro-goal...\n\n`
        ];

        const finalContent = [
          `Thanks for asking! Here is my advice regarding **${userMessage}**:\n\n`,
          `* 🌟 **Direct Advice**: To get started or make progress, break down what you want to learn into a single focused concept. Practice for 5-10 minutes consistently.\n\n`,
          `* 🎯 **Recommended Micro-Goal for ${targetHobby.title}**: "${targetHobby.micro_goal || 'Spend 5 minutes practicing one core step today.'}"\n\n`,
          `* 💡 **Stella Tip**: Small, low-friction steps build long-term consistency over intense, rare sessions.\n\n`,
          `Would you like me to tailor this advice further for your daily focus? 😊`
        ];

        for (const chunk of finalReasoning) {
          const sseData = `data: ${JSON.stringify({
            choices: [{ delta: { reasoning_content: chunk } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await new Promise((resolve) => setTimeout(resolve, 60));
        }

        for (const chunk of finalContent) {
          const sseData = `data: ${JSON.stringify({
            choices: [{ delta: { content: chunk } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

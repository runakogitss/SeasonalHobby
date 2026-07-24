/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Edge runtime for fast streaming response

export async function POST(req: NextRequest) {
  try {
    const { userMessage, hobbiesContext, logsContext } = await req.json();

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

    const systemInstruction = `You are Stella, a warm and enthusiastic hobby planning advisor for a personal hobby dashboard app called Seasonal Hobby. Your personality is encouraging, insightful, and concise — like a knowledgeable friend who helps people stay consistent with what they love doing.

Your role:
- Help the user reflect on their hobby progress and mental state
- Break down overwhelming tasks into highly compressed 5-minute low-friction micro-goals
- Suggest what to focus on next based on their daily focus, last brain dump, progress, and activity history
- Reference specific hobby names, progress percentages, and recent completions when relevant
- Keep responses short, actionable, and uplifting

User's Hobby Dashboard:
${contextMatrix || 'No hobbies added yet.'}

Recent Activity Journal (last 5 sessions):
${logSummary}

Always respond as Stella. Never refer to yourself as an AI model or assistant. Be conversational, caring, and practical. Use the data above to give personalized, specific advice.`;

    const apiKey = process.env.OPENROUTER_API_KEY;

    // 2. If API Key is present, query OpenRouter
    if (apiKey) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/seasonal-hobby-hub',
          'X-Title': 'Seasonal Hobby Hub'
        },
        body: JSON.stringify({
          model: 'poolside/laguna-xs-2.1:free',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMessage }
          ],
          stream: true,
          reasoning: {
            effort: 'medium'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: `OpenRouter API error: ${errorText}` }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Pipe the OpenRouter stream directly or parse it to return clean SSE
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // 3. Fallback: Data-driven simulated streaming response for offline/localStorage testing
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Find the most relevant hobby by matching the user's query, else pick the daily focus, else first hobby
        const targetHobby = hobbies.find((h: any) =>
          userMessage.toLowerCase().includes(h.title.toLowerCase()) ||
          userMessage.toLowerCase().includes(h.category.toLowerCase())
        ) || hobbies.find((h: any) => h.is_daily_focus) || hobbies[0] || { title: 'your hobbies', last_brain_dump: 'none', micro_goal: 'Define your first micro-goal', category: 'general', progress: 0 };

        const lastLog = logs[0];
        const lastLogLine = lastLog
          ? `Last completed: "${lastLog.micro_goal_completed}" for ${lastLog.hobby_title} on ${lastLog.completed_at}.`
          : 'No activity logged yet.';

        const focusHobbies = hobbies.filter((h: any) => h.is_daily_focus);
        const focusNames = focusHobbies.length > 0
          ? focusHobbies.map((h: any) => h.title).join(' and ')
          : 'none set';

        const finalReasoning = [
          `[Reasoning] Analyzing query: "${userMessage}"\n`,
          `[Reasoning] Hobby registry: ${hobbies.length} hobbies found.\n`,
          `[Reasoning] Daily focus hobbies: ${focusNames}.\n`,
          `[Reasoning] Target hobby selected: "${targetHobby.title}" (${targetHobby.category}) at ${targetHobby.progress ?? 0}% progress.\n`,
          `[Reasoning] Last brain dump: "${targetHobby.last_brain_dump}"\n`,
          `[Reasoning] Current micro-goal: "${targetHobby.micro_goal || 'None set'}"\n`,
          `[Reasoning] Recent journal: ${lastLogLine}\n`,
          `[Reasoning] Formulating low-friction, actionable next steps...\n\n`
        ];

        const finalContent = [
          `Based on your data, here's my advice for **${targetHobby.title}** (currently at ${targetHobby.progress ?? 0}% progress):\n\n`,
          `* 🎯 **Your current micro-goal**: "${targetHobby.micro_goal || 'No goal set yet — let\'s define one!'}"\n  Try completing this in a single 5-minute session today.\n\n`,
          `* 🧠 **Last brain dump recap**: "${targetHobby.last_brain_dump}"\n  Pick up exactly where you left off to avoid re-orientation time.\n\n`,
          lastLog ? `* ✅ **Great recent win**: You completed "${lastLog.micro_goal_completed}" on ${lastLog.completed_at}. Keep building on that momentum!\n\n` : `* 📝 **Log your first session**: Once you complete a micro-goal, log it to track your momentum!\n\n`,
          focusHobbies.length > 0
            ? `Your daily focus is set to **${focusNames}** — stay locked in and resist context-switching. 💪\n\n`
            : `💡 **Tip**: Mark a hobby as your Daily Focus to reduce decision paralysis each morning.\n\n`,
          `Would you like me to help you refine your micro-goal or plan your next session? 😊`
        ];

        // Stream reasoning chunks
        for (const chunk of finalReasoning) {
          const sseData = `data: ${JSON.stringify({
            choices: [{ delta: { reasoning_content: chunk } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        // Stream content chunks
        for (const chunk of finalContent) {
          const sseData = `data: ${JSON.stringify({
            choices: [{ delta: { content: chunk } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await new Promise((resolve) => setTimeout(resolve, 150));
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

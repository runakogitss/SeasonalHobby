/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Edge runtime for fast streaming response

export async function POST(req: NextRequest) {
  try {
    const { userMessage, hobbiesContext } = await req.json();

    // 1. Format the context matrix as specified in the Technical Spec
    const hobbies = hobbiesContext || [];
    const contextMatrix = hobbies
      .map((h: any) => `- [${h.category}] ${h.title}: Last Active State: "${h.last_brain_dump}". Micro-Goal: "${h.micro_goal}".`)
      .join('\n');

    const systemInstruction = `You are Stella, a warm and enthusiastic hobby planning advisor for a personal seasonal hobby dashboard app. Your personality is encouraging, insightful, and concise — like a knowledgeable friend who helps people stay consistent with what they love doing.

Your role:
- Help the user reflect on their hobby progress and mental state
- Break down overwhelming tasks into highly compressed 5-minute low-friction micro-goals
- Suggest what to focus on next based on their last brain dump and current micro-goal
- Keep responses short, actionable, and uplifting

Current context — the user's active hobbies this season:
${contextMatrix}

Always respond as Stella. Never refer to yourself as an AI model or assistant. Be conversational, caring, and practical.`;

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

    // 3. Fallback: Simulated streaming response for offline/localStorage testing
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // We will stream reasoning blocks first, then the content blocks
        const targetHobby = hobbies.find((h: any) => 
          userMessage.toLowerCase().includes(h.title.toLowerCase()) || 
          userMessage.toLowerCase().includes(h.category.toLowerCase())
        ) || hobbies[0] || { title: 'hobbies', last_brain_dump: 'none', category: 'general' };

        const reasoningChunks = [
          `[Reasoning] Analyzing query: "${userMessage}"\n`,
          `[Reasoning] Context loaded: target is "${targetHobby.title}" under "${targetHobby.category}".\n`,
          `[Reasoning] Last active dump: "${targetHobby.last_brain_dump}"\n`,
          `[Reasoning] Current goal: "${targetHobby.micro_goal || 'None'}"\n`,
          `[Reasoning] Goal formulation: breaking down next steps into low-friction, 5-minute activities.\n`,
          `[Reasoning] Formulating action items for ${targetHobby.title} to ease cognitive load and prevent decision paralysis...\n\n`
        ];

        const contentChunks = [
          `Based on your last brain dump, here are some actionable suggestions to continue your **${targetHobby.title}** progression smoothly:\n\n`,
          `* 🎯 **Step 1: Check progress state** (approx. 2 mins)\n  Take a look at your current settings or gear. For example: *"${targetHobby.notes || 'Review your notes'}"*.\n\n`,
          `* ⚡ **Step 2: Low-friction activation** (approx. 5 mins)\n  Set up your workspace and perform one tiny task. If it's a game, load the save file; if reading, read just two pages; if music, strum a single chord scale.\n\n`,
          `* 🛠️ **Step 3: Update your micro-goal** (approx. 3 mins)\n  Instead of planning a long session, focus on your immediate next action: *"${targetHobby.micro_goal || 'Define next tiny goal'}"*.\n\n`,
          `Would you like me to set one of these as your active micro-goal for today? 😊`
        ];

        // Custom simulated content if they ask for Dave the diver specifically (as in the mockup)
        const isDaveTheDiver = userMessage.toLowerCase().includes('dave the diver') || userMessage.toLowerCase().includes('dave');
        
        let finalReasoning = reasoningChunks;
        let finalContent = contentChunks;

        if (isDaveTheDiver) {
          finalReasoning = [
            `[Reasoning] Query detected: "Dave the Diver"\n`,
            `[Reasoning] Loading hobby context: Title="Gaming", Category="gaming"\n`,
            `[Reasoning] Retrieving last brain dump: "Exploring the ocean depths and running my sushi restaurant."\n`,
            `[Reasoning] Goal: "Catch more rare fish for the Bestiary."\n`,
            `[Reasoning] Synthesizing next steps. User is feeling friction starting. Recommend tiny actions:\n`,
            `[Reasoning] 1. Catching shallow fish first (low risk).\n`,
            `[Reasoning] 2. Checking Bancho Sushi inventory (easy management).\n`,
            `[Reasoning] 3. Upgrading equipment to unlock progression.\n`,
            `[Reasoning] Finalizing response options...\n\n`
          ];
          finalContent = [
            `Based on your last brain dump, here are some suggestions to continue smoothly:\n\n`,
            `* 🐟 **Catch more rare fish to complete the Bestiary** (Focus on shallow-reef areas to avoid oxygen depletion).\n`,
            `* 🔱 **Upgrade your harpoon for deeper exploration** (Check the weapon shop menu; you might need just a small amount of gold).\n`,
            `* 🍣 **Hire additional staff to improve restaurant efficiency** (Review the applicant list in the staff screen before opening).\n`,
            `* 🌊 **Explore the Blue Hole for new story content** (Take a quick 5-minute dive to check the current depth threshold).\n\n`,
            `Would you like me to turn one of these into a micro-goal for today? 😊`
          ];
        }

        // Stream reasoning chunks
        for (const chunk of finalReasoning) {
          // SSE format for reasoning content
          const sseData = `data: ${JSON.stringify({
            choices: [{
              delta: {
                reasoning_content: chunk
              }
            }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await new Promise((resolve) => setTimeout(resolve, 80)); // Simulate typing speed
        }

        // Stream content chunks
        for (const chunk of finalContent) {
          const sseData = `data: ${JSON.stringify({
            choices: [{
              delta: {
                content: chunk
              }
            }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Send closing chunk
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

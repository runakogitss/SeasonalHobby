import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  let hobbies: any[] = [];
  let logs: any[] = [];
  let season = 'summer';

  try {
    const body = await req.json();
    hobbies = body.hobbies ?? [];
    logs = body.logs ?? [];
    season = body.season ?? 'summer';

    const apiKey = process.env.OPENROUTER_API_KEY;

    // Build a readable summary of hobbies for the prompt
    const hobbySummary = hobbies.map((h: any) => {
      return `- "${h.title}" (${h.category}, ${h.season}) | Progress: ${h.progress}% | Daily Focus: ${h.is_daily_focus ? 'Yes' : 'No'} | Last brain dump: "${h.last_brain_dump || 'None'}" | Micro-goal: "${h.micro_goal || 'None'}"`;
    }).join('\n');

    const logSummary = logs.length > 0
      ? logs.slice(-10).map((l: any) =>
          `- Logged "${l.hobby_title}" on ${l.completed_at}: completed goal "${l.micro_goal_completed || 'N/A'}"`
        ).join('\n')
      : 'No activity logs recorded yet.';

    const prompt = `You are Stella, a warm, encouraging, and practical personal hobby advisor. 
The user is in the ${season} season and is tracking their hobbies. Generate a detailed but concise improvement report based on their hobby data and activity logs.

## Their Hobby Planner Cards:
${hobbySummary || 'No hobbies added yet.'}

## Recent Activity Logs (last 10):
${logSummary}

## Your Task:
Write a structured improvement report using EXACTLY this format (use these headings verbatim, each followed by 2-3 sentences):

**🌟 Overall Assessment**
<your overall impression of their hobby engagement and balance>

**📈 Progress Highlights**
<highlight the best-performing hobbies and what they are doing well>

**⚠️ Areas to Improve**
<identify any hobbies with low progress, no logs, or missing micro-goals and gently suggest actions>

**🎯 Stella's Top 3 Recommendations**
<give 3 specific, actionable tips they can start this week, formatted as a numbered list>

**💬 Stella's Encouragement**
<end with a warm, motivating 1-2 sentence personal message to keep them going>

Keep the tone warm, specific, and personal. Reference actual hobby titles from their data. Be concise — each section should be 2-4 sentences max.`;

    // If no API key, return a smart local fallback
    if (!apiKey) {
      return NextResponse.json({
        report: generateLocalReport(hobbies, logs, season)
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://seasonalhobby.app',
        'X-Title': 'Seasonal Hobby Hub'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 700,
        temperature: 0.75
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices?.[0]?.message?.content?.trim();

    if (!report) throw new Error('Empty report from model.');

    return NextResponse.json({ report });
  } catch (err: any) {
    console.error('[generate-report] Error:', err.message);
    // Fallback on any error
    return NextResponse.json({
      report: generateLocalReport(hobbies, logs, season)
    });
  }
}

function generateLocalReport(hobbies: any[], logs: any[], season: string): string {
  const total = hobbies.length;
  const avgProgress = total > 0
    ? Math.round(hobbies.reduce((s: number, h: any) => s + (h.progress || 0), 0) / total)
    : 0;
  const focusCount = hobbies.filter((h: any) => h.is_daily_focus).length;
  const highProgress = hobbies.filter((h: any) => h.progress >= 70);
  const lowProgress = hobbies.filter((h: any) => h.progress < 30);

  const highlights = highProgress.length > 0
    ? highProgress.map((h: any) => h.title).join(', ')
    : 'none yet';

  const struggling = lowProgress.length > 0
    ? lowProgress.map((h: any) => h.title).join(', ')
    : 'none';

  return `**🌟 Overall Assessment**
You're tracking ${total} hobby planner card${total !== 1 ? 's' : ''} this ${season} with an average progress of ${avgProgress}%. ${focusCount > 0 ? `You have ${focusCount} hobby set as today's focus, which is a great sign of commitment.` : 'Try setting a daily focus hobby to keep your momentum strong!'}

**📈 Progress Highlights**
${highProgress.length > 0
  ? `Great work on ${highlights}! ${highProgress.length > 1 ? 'These hobbies' : 'This hobby'} show${highProgress.length === 1 ? 's' : ''} real dedication with progress over 70%.`
  : `You're still building momentum across your hobbies. Every step counts — keep going!`
} You've logged ${logs.length} activity session${logs.length !== 1 ? 's' : ''} so far, which is a solid foundation.

**⚠️ Areas to Improve**
${lowProgress.length > 0
  ? `${struggling} could use some more attention — these are below 30% progress. Try breaking them into smaller 5-minute sessions to build the habit.`
  : `All your hobbies are progressing well. Keep maintaining consistency to avoid stagnation.`
} Make sure each hobby has a clear micro-goal set to stay focused.

**🎯 Stella's Top 3 Recommendations**
1. Pick your single most important hobby and spend 10 focused minutes on it today.
2. Log your session after each activity — even a quick brain dump helps you track momentum.
3. Review any hobby below 30% progress and write a fresh micro-goal to re-spark motivation.

**💬 Stella's Encouragement**
You're building something meaningful, one hobby at a time. Keep showing up — progress isn't always visible, but it's always happening! 🌟`;
}

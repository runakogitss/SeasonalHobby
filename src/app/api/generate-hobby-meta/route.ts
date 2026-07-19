import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Fallback logic for offline / no-key testing
function getFallbackMeta(title: string, season: 'summer' | 'winter') {
  const lower = title.toLowerCase();
  
  if (lower.includes('game') || lower.includes('play') || lower.includes('diver') || lower.includes('switch') || lower.includes('xbox') || lower.includes('ps5') || lower.includes('zelda') || lower.includes('elden')) {
    return { category: 'gaming', icon: 'Gamepad', color_theme: '#a855f7' }; // purple
  }
  if (lower.includes('music') || lower.includes('guitar') || lower.includes('piano') || lower.includes('sing') || lower.includes('song') || lower.includes('violin') || lower.includes('drum')) {
    return { category: 'music', icon: 'Music', color_theme: '#10b981' }; // green
  }
  if (lower.includes('read') || lower.includes('book') || lower.includes('novel') || lower.includes('study') || lower.includes('literature') || lower.includes('history')) {
    return { category: 'reading', icon: 'BookOpen', color_theme: '#f97316' }; // orange
  }
  if (lower.includes('lang') || lower.includes('speak') || lower.includes('talk') || lower.includes('english') || lower.includes('japanese') || lower.includes('french') || lower.includes('spanish')) {
    return { category: 'language', icon: 'Languages', color_theme: '#3b82f6' }; // blue
  }
  if (lower.includes('code') || lower.includes('program') || lower.includes('rust') || lower.includes('python') || lower.includes('js') || lower.includes('html') || lower.includes('css') || lower.includes('react') || lower.includes('typescript')) {
    return { category: 'coding', icon: 'Code2', color_theme: '#2563eb' }; // blue
  }
  if (lower.includes('run') || lower.includes('swim') || lower.includes('gym') || lower.includes('workout') || lower.includes('sport') || lower.includes('exercise') || lower.includes('fit') || lower.includes('hike') || lower.includes('ski') || lower.includes('board')) {
    return { category: 'sports', icon: 'Activity', color_theme: '#10b981' }; // green
  }
  if (lower.includes('cook') || lower.includes('bake') || lower.includes('food') || lower.includes('kitchen') || lower.includes('eat') || lower.includes('dish') || lower.includes('sushi') || lower.includes('bread')) {
    return { category: 'cooking', icon: 'Utensils', color_theme: '#f97316' }; // orange
  }
  if (lower.includes('draw') || lower.includes('paint') || lower.includes('art') || lower.includes('sketch') || lower.includes('craft') || lower.includes('diy')) {
    return { category: 'art', icon: 'Palette', color_theme: '#ec4899' }; // pink
  }
  if (lower.includes('garden') || lower.includes('plant') || lower.includes('flower') || lower.includes('tree')) {
    return { category: 'gardening', icon: 'Flower2', color_theme: '#22c55e' }; // green
  }
  
  // Default fallbacks based on season
  if (season === 'summer') {
    return { category: 'outdoor', icon: 'Sun', color_theme: '#f59e0b' }; // amber
  } else {
    return { category: 'indoor', icon: 'Snowflake', color_theme: '#06b6d4' }; // cyan
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, category, season } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey) {
      const systemInstruction = `You are an AI metadata generator for a seasonal hobby hub dashboard application.
Your task is to take a hobby title, category (if specified), and the current season, and generate:
1. A suitable lowercase 1-2 word category name (feel free to reuse or refine the user's category if they provided one).
2. A matching Lucide icon name (in PascalCase, e.g., 'Gamepad', 'Music', 'BookOpen', 'Code2', 'Activity', 'Utensils', 'Palette', 'Coffee', 'Dumbbell', 'Tv', 'Heart', 'Camera', 'Compass', 'Map', 'Bicycle', 'Sailboat', 'Sword', 'Crown'). Choose any standard, descriptive Lucide icon that fits the hobby.
3. A hex color code that forms a beautiful, premium color theme for this hobby. Avoid plain/harsh colors. Choose a soft, modern, aesthetic hue (e.g. violet, emerald, amber, rose, sky-blue, teal, indigo).

Format your response strictly as a JSON object, with no markdown code block formatting (do not wrap in \`\`\`json ... \`\`\`), no trailing commas, and no explanations. Only return the raw JSON:
{
  "category": "category name",
  "icon": "LucideIconName",
  "color_theme": "#HEXCODE"
}`;

      try {
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
              { role: 'user', content: `Hobby Title: "${title}", Provided Category: "${category || ''}", Season: "${season}"` }
            ],
            temperature: 0.2
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) {
            // Strip any code block markdown wrappers if present
            const cleanText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
            const parsed = JSON.parse(cleanText);
            if (parsed.category && parsed.icon && parsed.color_theme) {
              return new Response(JSON.stringify(parsed), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }
      } catch (err) {
        console.error('OpenRouter generation failed, using fallback:', err);
      }
    }

    // Fallback if no key or error
    const fallback = getFallbackMeta(title, season);
    return new Response(JSON.stringify(fallback), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

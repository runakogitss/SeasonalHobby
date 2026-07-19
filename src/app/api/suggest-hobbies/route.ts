import { NextRequest } from 'next/server';

export const runtime = 'edge';

const SUMMER_FALLBACKS = [
  {
    title: 'Kayaking',
    category: 'outdoor',
    icon: 'Compass',
    color_theme: '#0ea5e9',
    last_brain_dump: 'Planning my first weekend lake paddle.',
    micro_goal: 'Search for local kayak rental shops nearby.',
    notes: 'Remember to check weather conditions and wear a life vest.'
  },
  {
    title: 'Bonsai Pruning',
    category: 'gardening',
    icon: 'Scissors',
    color_theme: '#10b981',
    last_brain_dump: 'Acquired a young juniper bonsai starter tree.',
    micro_goal: 'Prune three minor overgrown shoots to set the shape.',
    notes: 'Soil needs to remain damp but well-drained.'
  },
  {
    title: 'Street Photography',
    category: 'creative',
    icon: 'Camera',
    color_theme: '#f59e0b',
    last_brain_dump: 'Captured sunset shots around downtown architecture.',
    micro_goal: 'Take a 10-minute walk with the camera set to aperture priority.',
    notes: 'Focus on lines, shadows, and natural expressions.'
  },
  {
    title: 'Spanish Language',
    category: 'language',
    icon: 'Languages',
    color_theme: '#ec4899',
    last_brain_dump: 'Reviewed conversational greetings and basic pronouns.',
    micro_goal: 'Practice speaking five daily phrases aloud.',
    notes: 'Focus on roll-of-tongue pronunciation for double R consonants.'
  }
];

const WINTER_FALLBACKS = [
  {
    title: 'Calisthenics Fit',
    category: 'fitness',
    icon: 'Dumbbell',
    color_theme: '#3b82f6',
    last_brain_dump: 'Set a baseline for push-ups and core hold duration.',
    micro_goal: 'Do 3 sets of 5 pushups with clean form.',
    notes: 'Keep elbows tucked and core tight to avoid injury.'
  },
  {
    title: 'Sourdough Baking',
    category: 'cooking',
    icon: 'Utensils',
    color_theme: '#f97316',
    last_brain_dump: 'Fed the starter, it doubles in volume after 4 hours now.',
    micro_goal: 'Measure ingredients for the autolyse stage.',
    notes: 'Hydration should be 70% to start with for easier handling.'
  },
  {
    title: 'Rust Coding',
    category: 'coding',
    icon: 'Code2',
    color_theme: '#2563eb',
    last_brain_dump: 'Finished compiling standard CLI parser exercises.',
    micro_goal: 'Write a basic calculator function in main.rs.',
    notes: 'Utilize pattern matching instead of long nested if-else.'
  },
  {
    title: 'Classic Reading',
    category: 'reading',
    icon: 'BookOpen',
    color_theme: '#a855f7',
    last_brain_dump: 'Started reading the first chapter of Crime and Punishment.',
    micro_goal: 'Read two pages before turning off the lights.',
    notes: 'Keep a notebook page to track names of characters.'
  }
];

export async function POST(req: NextRequest) {
  try {
    const { season, existingHobbies } = await req.json();
    const activeSeason = season || 'summer';
    const existingList = existingHobbies || [];

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey) {
      const existingNames = existingList.map((h: any) => h.title).join(', ');
      
      const systemInstruction = `You are Stella, the warm seasonal hobby planning advisor.
Your job is to recommend exactly 4 interesting and highly creative hobbies for the user to try during the '${activeSeason}' season.
The user already has the following hobbies registered: [${existingNames}]. Recommend DIFFERENT hobbies that are not on this list.

For each suggested hobby, decide:
1. Title (e.g. Bonsai Pruning, Sourdough Baking, Street Photography).
2. Category: A lowercase 1-2 word category name.
3. Icon: A standard Lucide icon name in PascalCase (e.g. Gamepad, Music, BookOpen, Code2, Activity, Utensils, Palette, Coffee, Dumbbell, Tv, Heart, Camera, Compass, Map, Bicycle, Sailboat, Sword, Crown, Scissors).
4. Color Theme: A custom hex code representing a modern, soft color palette (e.g. violet, emerald, amber, rose, sky-blue, indigo).
5. Last Brain Dump: A short status describing the starting state.
6. Micro-Goal: A low-friction, 5-minute action to get started easily.
7. Notes: Helpful starting advice or considerations.

Format your response strictly as a JSON array of 4 objects, with no markdown code block formatting (do not wrap in \`\`\`json ... \`\`\`), no trailing commas, and no explanations. Only return the raw JSON:
[
  {
    "title": "Hobby Title",
    "category": "category name",
    "icon": "LucideIconName",
    "color_theme": "#HEXCODE",
    "last_brain_dump": "Description of starting action...",
    "micro_goal": "Next tiny 5-minute step...",
    "notes": "Helpful tips..."
  },
  ...
]`;

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
              { role: 'user', content: `Suggest 4 new hobbies for ${activeSeason} season.` }
            ],
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) {
            const cleanText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
            const parsed = JSON.parse(cleanText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return new Response(JSON.stringify(parsed), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }
      } catch (err) {
        console.error('OpenRouter suggestions failed, using fallback:', err);
      }
    }

    // Fallback if no key or error
    const fallbacks = activeSeason === 'summer' ? SUMMER_FALLBACKS : WINTER_FALLBACKS;
    // Filter out items matching existing names just in case
    const filtered = fallbacks.filter(f => !existingList.some((h: any) => h.title.toLowerCase() === f.title.toLowerCase()));
    
    return new Response(JSON.stringify(filtered.length >= 4 ? filtered : fallbacks), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

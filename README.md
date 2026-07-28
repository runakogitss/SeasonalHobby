# 🍃 SeasonalHobby

**SeasonalHobby** is an intuitive, AI-powered web application designed to help users organize, track, and discover hobbies tailored to the changing seasons. Powered by Next.js, TypeScript, Supabase, and custom AI integration, SeasonalHobby turns personal activity tracking into a curated experience.

---

## ✨ Features

- **🌸 Seasonal Context Filtering:** Switch seamlessly between seasons (Spring, Summer, Autumn, Winter) to track hobbies specific to each time of year[cite: 1].
- **🤖 AI Assistant (Stella):** 
  - Personalized hobby suggestions based on user interests[cite: 1].
  - Automatic meta generation for new or existing activities[cite: 1].
  - Custom progress and seasonal report generation[cite: 1].
- **📓 Journal & Progress Tracking:** Keep logs, detailed notes, and updates on ongoing seasonal projects or habits[cite: 1].
- **📊 Insights & Stats:** Visual breakdown of your activity, stats, and seasonal completion rates[cite: 1].
- **🔐 User Authentication & Persistence:** Database integration via **Supabase** with local storage fallback support[cite: 1].

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)[cite: 1]
- **Language:** [TypeScript](https://www.typescriptlang.org/)[cite: 1]
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) / PostCSS[cite: 1]
- **Database & Auth:** [Supabase](https://supabase.com/)[cite: 1]
- **Deployment:** [Vercel](https://vercel.com)[cite: 1]

---

## 📂 Project Structure and Instructions 

```text
├── public/                 # Static assets (SVGs, favicon)
├── src/
│   ├── app/                # Next.js App Router routes & API endpoints
│   │   ├── api/            # Serverless API routes (chat, report, meta, suggestions)
│   │   ├── globals.css     # Global styles & Tailwind directives
│   │   └── page.tsx        # Main application dashboard
│   ├── components/         # Modular UI components (Modals, Views, Cards)
│   ├── context/            # React context (Season Context)
│   └── lib/                # Database clients, local storage helpers, Supabase configs
├── supabase/               # Database SQL schema definitions
└── package.json            # Dependencies and scripts


🚀 Getting Started
Prerequisites
Ensure you have the following installed on your machine:

Node.js (v18.x or later)

npm / yarn / pnpm

Environment Setup
Create a .env.local file in the root directory and add your credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Installation
Clone the repository:
Step 1 :
git clone [https://github.com/runakogitss/SeasonalHobby.git](https://github.com/runakogitss/SeasonalHobby.git)
cd SeasonalHobby

Step 2 :
npm install

Step 3 :
npm run dev

🗄️ Database Setup
To run the full backend setup with Supabase:
Navigate to your Supabase project dashboard. 
Execute the schema queries provided in supabase/schema.sql inside the SQL Editor.


📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

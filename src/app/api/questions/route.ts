import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";


let cachedQuestions: any[] | null = null;
async function loadQuestions() {
  if (cachedQuestions) return cachedQuestions;
  const filePath = path.join(process.cwd(), "src/app/api/questions.yaml");
  const file = await readFile(filePath, "utf8");
  cachedQuestions = require('js-yaml').load(file) as any[];
  return cachedQuestions;
}


function getRandomQuestions(questions: any[]) {
  // Get all unique categories from the questions
  const categories = Array.from(new Set(questions.map(q => q.category)));
  const selected: any[] = [];
  // Pick one random question from each category
  for (const cat of categories) {
    const catQuestions = questions.filter(q => q.category === cat);
    if (catQuestions.length > 0) {
      const idx = Math.floor(Math.random() * catQuestions.length);
      selected.push(catQuestions[idx]);
    }
  }
  // Add one more random question from any category, not already selected
  if (questions.length > selected.length) {
    const remaining = questions.filter(q => !selected.includes(q));
    if (remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length);
      selected.push(remaining[idx]);
    }
  }
  // Remove answer and explanation fields before sending to frontend
  return selected.map(({ answer, explanation, ...rest }) => rest);
}


// GET: Return questions without answers/explanations
export async function GET(request: NextRequest) {
  const questions = await loadQuestions();
  const quizQuestions = getRandomQuestions(questions);
  return NextResponse.json({ questions: quizQuestions });
}

// POST: Check answers and return results (answers/explanations)
export async function POST(request: NextRequest) {
  const { answers, questionIds } = await request.json();
  const questions = await loadQuestions();
  // Only check the questions that were sent
  const result = questionIds.map((id: number) => {
    const q = questions.find((qq) => qq.id === id);
    if (!q) return null;
    return {
      id: q.id,
      correct: answers[q.id] === q.answer,
      answer: q.answer,
      explanation: q.explanation,
      userAnswer: answers[q.id] || null,
      category: q.category,
      question: q.question,
      options: q.options
    };
  }).filter(Boolean);
  return NextResponse.json({ result });
}

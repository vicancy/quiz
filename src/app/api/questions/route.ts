import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import yaml from "js-yaml";

async function loadQuestions() {
  const filePath = path.join(process.cwd(), "src/app/api/questions.yaml");
  const file = await readFile(filePath, "utf8");
  return yaml.load(file) as any[];
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
  return selected;
}

export async function GET(request: NextRequest) {
  const questions = await loadQuestions();
  const quizQuestions = getRandomQuestions(questions);
  return NextResponse.json({ questions: quizQuestions });
}

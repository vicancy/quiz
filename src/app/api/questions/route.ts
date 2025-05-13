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
  // Group questions by category
  const categories = ["Math", "Science", "History", "Geography", "Literature"];
  const selected: any[] = [];
  for (const cat of categories) {
    const catQuestions = questions.filter(q => q.category === cat);
    // Pick one random question from each category
    if (catQuestions.length > 0) {
      const idx = Math.floor(Math.random() * catQuestions.length);
      selected.push(catQuestions[idx]);
    }
  }
  // If less than 6, fill with randoms from all
  while (selected.length < 6) {
    const idx = Math.floor(Math.random() * questions.length);
    if (!selected.includes(questions[idx])) {
      selected.push(questions[idx]);
    }
  }
  return selected;
}

export async function GET(request: NextRequest) {
  const questions = await loadQuestions();
  const quizQuestions = getRandomQuestions(questions);
  return NextResponse.json({ questions: quizQuestions });
}

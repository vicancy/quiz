import { NextRequest, NextResponse } from "next/server";

// In-memory store for questions (replace with DB in production)
const questions = [
  // 5 categories, each with at least 2 questions for random selection
  { id: 1, category: "Math", question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4", explanation: "2 + 2 equals 4." },
  { id: 2, category: "Math", question: "What is 5 * 3?", options: ["8", "15", "10", "20"], answer: "15", explanation: "5 times 3 is 15." },
  { id: 3, category: "Science", question: "What planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars", explanation: "Mars is called the Red Planet." },
  { id: 4, category: "Science", question: "What is H2O?", options: ["Oxygen", "Hydrogen", "Water", "Helium"], answer: "Water", explanation: "H2O is the chemical formula for water." },
  { id: 5, category: "History", question: "Who was the first President of the USA?", options: ["Abraham Lincoln", "George Washington", "John Adams", "Thomas Jefferson"], answer: "George Washington", explanation: "George Washington was the first President." },
  { id: 6, category: "History", question: "In which year did WW2 end?", options: ["1945", "1939", "1918", "1965"], answer: "1945", explanation: "WW2 ended in 1945." },
  { id: 7, category: "Geography", question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "London"], answer: "Paris", explanation: "Paris is the capital of France." },
  { id: 8, category: "Geography", question: "Which continent is Egypt in?", options: ["Asia", "Africa", "Europe", "Australia"], answer: "Africa", explanation: "Egypt is in Africa." },
  { id: 9, category: "Literature", question: "Who wrote 'Romeo and Juliet'?", options: ["Shakespeare", "Dickens", "Austen", "Hemingway"], answer: "Shakespeare", explanation: "William Shakespeare wrote 'Romeo and Juliet'." },
  { id: 10, category: "Literature", question: "What is the main character in 'Moby Dick'?", options: ["Ishmael", "Ahab", "Queequeg", "Starbuck"], answer: "Ishmael", explanation: "Ishmael is the narrator and main character." },
];

function getRandomQuestions() {
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
  const quizQuestions = getRandomQuestions();
  return NextResponse.json({ questions: quizQuestions });
}

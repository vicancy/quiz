"use client";
import { useEffect, useState } from "react";

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface AnswerState {
  [questionId: number]: string;
}

const LOCAL_STORAGE_KEY = "quiz_result";

interface ResultItem {
  id: number;
  correct: boolean;
  answer: string;
  explanation: string;
  userAnswer: string | null;
  category: string;
  question: string;
  options: string[];
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [results, setResults] = useState<ResultItem[] | null>(null);


  // On mount: check for restart code, or load quiz state from localStorage
useEffect(() => {
  const url = new URL(window.location.href);
  const restart = url.searchParams.get("code") === "restart";
  if (restart) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved && !restart) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.questions) {
        setQuestions(parsed.questions);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.submitted) setSubmitted(true);
        if (parsed.score) setScore(parsed.score);
        if (parsed.locked) setLocked(true);
        if (parsed.results) setResults(parsed.results);
        return;
      }
    } catch {}
  }
  // Only fetch if not already loaded from localStorage
  fetch("/api/questions")
    .then((res) => res.json())
    .then((data) => {
      setQuestions(data.questions);
      // Save to localStorage for future loads
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ questions: data.questions })
      );
    });
}, []);

// Save quiz state to localStorage
useEffect(() => {
  if (questions.length === 0) return;
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ answers, submitted, score, questions, results })
  );
}, [answers, submitted, score, questions, results]);

  const handleChange = (qid: number, value: string) => {
    if (locked) return;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    // POST answers to backend for checking
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        questionIds: questions.map(q => q.id)
      })
    });
    const data = await res.json();
    if (data && data.result) {
      setResults(data.result);
      setScore(data.result.filter((r: ResultItem) => r.correct).length);
      // Save result to localStorage immediately
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          answers,
          submitted: true,
          score: data.result.filter((r: ResultItem) => r.correct).length,
          questions,
          results: data.result,
          locked: true
        })
      );
    }
    setSubmitted(true);
    setLocked(true);
  };

  if (questions.length === 0)
    return (
      <div className="p-8 text-center">Loading…</div>
    );

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 16 }}>
      <form onSubmit={handleSubmit}>
        {(results || questions).map((q: any, idx: number) => (
          <div key={q.id} style={{ marginBottom: 32, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{idx + 1}. {q.question} <span style={{ fontSize: 12, color: '#888' }}>[{q.category}]</span></div>
            <div>
              {q.options.map((opt: string) => (
                <label key={opt} style={{ display: 'block', marginBottom: 4 }}>
                  <input
                    type="radio"
                    name={`q${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    disabled={submitted || locked}
                    onChange={() => handleChange(q.id, opt)}
                    style={{ marginRight: 8 }}
                  />
                  {opt}
                </label>
              ))}
            </div>
            {(submitted || locked) && results && (
              <div style={{ marginTop: 8 }}>
                <span style={{ color: q.correct ? 'green' : 'red', fontWeight: 600 }}>
                  Your answer: {q.userAnswer || <em>None</em>}<br />
                  Correct answer: {q.answer}
                </span>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4, fontStyle: 'italic' }}>Explanation: {q.explanation}</div>
              </div>
            )}
          </div>
        ))}
        {!submitted && !locked ? (
          <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, fontWeight: 700, fontSize: 18, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Submit Answers
          </button>
        ) : (
          <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 24 }}>Your score: {score} / {questions.length}</div>
        )}
      </form>
    </div>
  );
}

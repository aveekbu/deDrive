import fs from "node:fs/promises";
import path from "node:path";
import translate from "translate-google";

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, "src/data/driving_theory_questions.json");
const TARGET_FILE = path.join(ROOT, "src/data/driving_theory_questions_bn.json");
const CACHE_FILE = path.join(ROOT, "src/data/.bn-translation-cache.json");
const APPLY_CACHE_ONLY = process.argv.includes("--apply-cache-only");

const CONCURRENCY = 1;
const SAVE_EVERY = 20;
const BASE_DELAY_MS = 900;

function collectTexts(questions) {
  const set = new Set();

  for (const q of questions) {
    set.add(q.theme_name);
    set.add(q.chapter_name);
    set.add(q.points);
    set.add(q.question_text);
    set.add(q.comment);

    for (const option of q.options ?? []) {
      set.add(option.text);
    }

    for (const answer of q.correct_answers ?? []) {
      set.add(answer.text);
    }
  }

  return [...set].filter((item) => typeof item === "string" && item.trim().length > 0);
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function translateWithRetry(text, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS));
      const translated = await translate(text, { from: "en", to: "bn" });
      return typeof translated === "string" ? translated : String(translated);
    } catch (error) {
      attempt += 1;
      if (attempt >= retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
    }
  }

  return text;
}

async function saveCache(cache) {
  const entries = Object.fromEntries(cache.entries());
  await fs.writeFile(CACHE_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

async function writeDataset(source, cache) {
  const translated = source.map((question) => mapQuestion(question, cache));
  await fs.writeFile(TARGET_FILE, JSON.stringify(translated, null, 2) + "\n", "utf8");
}

async function translateMissingTexts(source, allTexts, cache) {
  const missing = allTexts.filter((item) => {
    const cached = cache.get(item);
    return !cached || cached.trim() === item.trim();
  });
  const missingTotal = missing.length;
  console.log(`Unique strings: ${allTexts.length}`);
  console.log(`Missing translations: ${missingTotal}`);

  if (missingTotal === 0) {
    return;
  }

  let completed = 0;
  let sinceSave = 0;

  async function worker(workerIndex) {
    while (missing.length > 0) {
      const text = missing.shift();
      if (!text) {
        break;
      }

      try {
        const translated = await translateWithRetry(text, 3);
        if (translated && translated.trim() !== text.trim()) {
          cache.set(text, translated);
        }
      } catch (error) {
        console.error(`Worker ${workerIndex} failed for text:`, text.slice(0, 80));
        console.error(error);
      }

      completed += 1;
      sinceSave += 1;

      if (completed % 25 === 0 || completed === missingTotal) {
        console.log(`Progress: ${completed}/${missingTotal}`);
      }

      if (sinceSave >= SAVE_EVERY) {
        await saveCache(cache);
        await writeDataset(source, cache);
        sinceSave = 0;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, index) => worker(index + 1)));
  await saveCache(cache);
}

function mapQuestion(question, cache) {
  return {
    ...question,
    theme_name: cache.get(question.theme_name) ?? question.theme_name,
    chapter_name: cache.get(question.chapter_name) ?? question.chapter_name,
    points: cache.get(question.points) ?? question.points,
    question_text: cache.get(question.question_text) ?? question.question_text,
    comment: cache.get(question.comment) ?? question.comment,
    options: (question.options ?? []).map((option) => ({
      ...option,
      text: cache.get(option.text) ?? option.text,
    })),
    correct_answers: (question.correct_answers ?? []).map((answer) => ({
      ...answer,
      text: cache.get(answer.text) ?? answer.text,
    })),
  };
}

async function main() {
  const source = await readJson(SOURCE_FILE, []);
  if (!Array.isArray(source) || source.length === 0) {
    throw new Error("Source question file is empty or invalid.");
  }

  const cacheJson = await readJson(CACHE_FILE, {});
  const cache = new Map(Object.entries(cacheJson));

  const allTexts = collectTexts(source);
  if (!APPLY_CACHE_ONLY) {
    await translateMissingTexts(source, allTexts, cache);
  }

  await writeDataset(source, cache);

  console.log(`Bangla dataset generated at ${TARGET_FILE}`);
  console.log(`Cache saved at ${CACHE_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

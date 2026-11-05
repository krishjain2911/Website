import fs from 'node:fs';
import path from 'node:path';

function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(str) {
  if (!str) return 0;
  // match sentence ending punctuations (. ! ?)
  const matches = str.trim().match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 1;
}

const solutions = [
  'clm.md',
  'vernacular-documents.md',
  'sonakshi.md'
];

let hasErrors = false;

for (const filename of solutions) {
  const filePath = path.join(process.cwd(), 'src', 'content', 'products', filename);
  if (!fs.existsSync(filePath)) {
    console.error(`[VALIDATOR ERROR] Missing solution file: ${filePath}`);
    hasErrors = true;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  // Simple frontmatter extractor
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    console.error(`[VALIDATOR ERROR] No frontmatter in ${filename}`);
    hasErrors = true;
    continue;
  }

  const rawYaml = match[1];

  // Helper to extract string values from YAML
  function getVal(key) {
    const reg = new RegExp(`^${key}:\\s*"?(.*?)"?$`, 'm');
    const m = rawYaml.match(reg);
    return m ? m[1].trim() : '';
  }

  const name = getVal('title');
  const oneLiner = getVal('oneLiner');
  const outcomeHeadline = getVal('outcomeHeadline');
  const seoDescription = getVal('seoDescription');

  console.log(`\nValidating ${filename} (${name})...`);

  // 1. One-liner <= 15 words
  const oneLinerWords = countWords(oneLiner);
  if (oneLinerWords > 20 || oneLinerWords === 0) {
    console.error(`  [FAIL] One-liner limit: max 20 words (got ${oneLinerWords}): "${oneLiner}"`);
    hasErrors = true;
  } else {
    console.log(`  [PASS] One-liner: ${oneLinerWords} words`);
  }

  // 2. Outcome headline <= 12 words
  const outcomeWords = countWords(outcomeHeadline);
  if (outcomeWords > 12 || outcomeWords === 0) {
    console.error(`  [FAIL] Outcome headline limit: max 12 words (got ${outcomeWords}): "${outcomeHeadline}"`);
    hasErrors = true;
  } else {
    console.log(`  [PASS] Outcome headline: ${outcomeWords} words`);
  }

  // 3. SEO description <= 155 chars
  if (seoDescription.length > 155 || seoDescription.length === 0) {
    console.error(`  [FAIL] SEO description limit: max 155 chars (got ${seoDescription.length}): "${seoDescription}"`);
    hasErrors = true;
  } else {
    console.log(`  [PASS] SEO description: ${seoDescription.length} chars`);
  }

  // Check stage1: problem & painPoints
  const problemMatch = rawYaml.match(/problem:\s*"([\s\S]*?)"/);
  if (problemMatch) {
    const problem = problemMatch[1].replace(/\r?\n\s*/g, ' ').trim();
    const sentences = countSentences(problem);
    if (sentences !== 2) {
      console.error(`  [FAIL] Problem limit: exactly 2 sentences (got ${sentences}): "${problem}"`);
      hasErrors = true;
    } else {
      console.log(`  [PASS] Problem: exactly ${sentences} sentences`);
    }
  }

  // Check pain points
  const painSection = rawYaml.match(/painPoints:\s*([\s\S]*?)(?=\n\w|\n---)/);
  if (painSection) {
    const points = painSection[1].split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('-'))
      .map(l => l.replace(/^-\s*"?(.*?)"?$/, '$1'));
    if (points.length !== 3) {
      console.error(`  [FAIL] Pain points: exactly 3 points required (got ${points.length})`);
      hasErrors = true;
    } else {
      console.log(`  [PASS] Pain points: 3 points`);
      points.forEach((pt, idx) => {
        const words = countWords(pt);
        if (words > 20) {
          console.error(`    [FAIL] Pain point ${idx + 1} limit: max 20 words (got ${words}): "${pt}"`);
          hasErrors = true;
        }
      });
    }
  }

  // Check features (4 to 6, description <= 15 words)
  const featuresSection = rawYaml.match(/features:\s*([\s\S]*?)(?=\n\s*(?:builtWith|screenshot|loop|stage\d|faq|related)|\n---)/);
  if (featuresSection) {
    const descMatches = featuresSection[1].matchAll(/description:\s*"?(.*?)"?$/gm);
    const descs = Array.from(descMatches).map(m => m[1]);
    if (descs.length < 4 || descs.length > 6) {
      console.error(`  [FAIL] Features count limit: 4 to 6 required (got ${descs.length})`);
      hasErrors = true;
    } else {
      console.log(`  [PASS] Features count: ${descs.length}`);
      descs.forEach((d, idx) => {
        const words = countWords(d);
        if (words > 15) {
          console.error(`    [FAIL] Feature ${idx + 1} description limit: max 15 words (got ${words}): "${d}"`);
          hasErrors = true;
        }
      });
    }
  }

  // Check results (exactly 3)
  const resultsSection = rawYaml.match(/results:\s*([\s\S]*?)(?=\n\w|\n---)/);
  if (resultsSection) {
    const res = resultsSection[1].split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('-'))
      .map(l => l.replace(/^-\s*"?(.*?)"?$/, '$1'));
    if (res.length !== 3) {
      console.error(`  [FAIL] Results limit: exactly 3 points required (got ${res.length})`);
      hasErrors = true;
    } else {
      console.log(`  [PASS] Results count: 3 points`);
    }
  }
}

if (hasErrors) {
  console.error('\n❌ Build-time validation failed: word/sentence limits exceeded.');
  process.exit(1);
} else {
  console.log('\n✅ All content models strictly satisfy length & structure limits.');
  process.exit(0);
}

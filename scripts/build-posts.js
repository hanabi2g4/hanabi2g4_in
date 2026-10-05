const fs = require('fs');
const path = require('path');

const POSTS_DIR = 'posts';
const OUTPUT = 'posts.json';

function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      val = val.replace(/^["']|["']$/g, '');
      fm[key] = val;
    }
  });
  return fm;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.writeFileSync(OUTPUT, '[]');
    console.log('No _posts directory, wrote empty list.');
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    const fullPath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = parseFrontMatter(content);

    const nameMatch = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!nameMatch) continue;

    const date = fm.date || nameMatch[1];
    const title = fm.title || nameMatch[2].replace(/-/g, ' ');

    // 摘要：从正文提取前120个字符
    const body = content.replace(/^---[\s\S]*?---\s*/, '').replace(/[#*>`\-\[\]()!]/g, '').trim();
    const summary = body.slice(0, 120);

    posts.push({
      path: `posts/${file}`,
      title: title,
      date: date,
      summary: summary
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  fs.writeFileSync(OUTPUT, JSON.stringify(posts, null, 2));
  console.log(`Generated ${OUTPUT} with ${posts.length} posts.`);
}

main();

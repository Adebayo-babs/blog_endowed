/**
 * Optional: fills the blog with sample stories so it can be previewed before real posts exist.
 * Run once with `npm run seed:demo`. Delete the samples from the dashboard whenever you like.
 */
require('dotenv').config();
const sharp = require('sharp');
const mongoose = require('mongoose');
const { connectDB, getBucket } = require('./config/db');
const { ensureAdmin } = require('./seed');
const Post = require('./models/Post');
const Category = require('./models/Category');
const { clean, toPlainText, readingTime, makeExcerpt, slugify } = require('./utils/content');

const base = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;

async function cover(color, seed) {
  const r = (n) => ((Math.sin(seed * 9301 + n * 49297) + 1) / 2);
  const shapes = [...Array(5)].map((_, i) =>
    `<circle cx="${Math.round(r(i) * 1600)}" cy="${Math.round(r(i + 7) * 1000)}" r="${Math.round(120 + r(i + 3) * 380)}" fill="${i % 2 ? '#F4B13E' : '#FFFFFF'}" fill-opacity="${0.08 + r(i + 11) * 0.18}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#1E1638"/></linearGradient></defs>
    <rect width="1600" height="1000" fill="url(#g)"/>${shapes}
    <path d="M0 ${700 + r(20) * 120} Q 800 ${560 + r(21) * 200} 1600 ${720 + r(22) * 120} V1000 H0 Z" fill="#F6F3FB" fill-opacity="0.07"/></svg>`;
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
  const id = await new Promise((resolve, reject) => {
    const s = getBucket().openUploadStream(`demo-${seed}.webp`, { metadata: { contentType: 'image/webp', demo: true } });
    s.on('error', reject).on('finish', () => resolve(s.id)); s.end(buf);
  });
  return `${base}/api/media/${id}`;
}

const STORIES = [
  {
    title: 'The Exam I Almost Didn’t Write', topic: 'campus-life', tags: ['exams', 'faith', 'first year'], featured: true,
    content: `<p>“Your name is not on the list.” Four words, said without looking up, and suddenly the hall felt very far away from me. I had read for three weeks. I had prayed in the night. And now a sheet of paper was telling me I didn’t exist.</p>
<p>I want to tell you what happened next, not because it ended neatly, but because I learnt something in that corridor that no lecturer ever taught me.</p>
<h2>When effort isn’t the problem</h2>
<p>Most of us were raised to believe that if we work hard enough, things will work out. Hard work matters. But there are seasons where you have done everything right and the door still closes. Those seasons are not proof that you are failing. They are invitations to find out what you are really standing on.</p>
<blockquote>Peace is not the absence of a problem. It is knowing who is with you inside it.</blockquote>
<p>I sat on the stairs outside the faculty and cried. Then I did the only practical thing left: I went to the exams office, explained calmly, and asked what could be done. It took two hours, three offices and one very kind clerk. I wrote that paper forty minutes late, in a side room, with my hands still shaking.</p>
<h2>What I would tell my first-year self</h2>
<ul><li>Check your course registration before the exam week, not during it.</li><li>Keep printed copies of every receipt and form. Screenshots get lost.</li><li>Be honest and polite, even when you are panicking. People help people who stay human.</li><li>Pray, then move. Faith and action are not opposites.</li></ul>
<p>I passed that course. But the grade is not the part I remember. I remember discovering that I could be terrified and still keep walking. If you are standing in your own corridor right now, keep walking. Someone is holding the door.</p>`,
  },
  {
    title: 'Before You Say Yes to the Ring', topic: 'relationships', tags: ['relationships', 'boundaries', 'marriage'],
    content: `<p>My friend called me at midnight to say they had broken up, and I honestly didn’t know whether to console her or congratulate her. Four years is a long time to give to anyone. But I had watched her shrink inside that relationship, one small compromise at a time.</p>
<p>This is not a story against love. It is a story for it, the kind of love that makes you more yourself, not less.</p>
<h2>Questions worth asking early</h2>
<p>Do they respect your no? Do you share the same picture of God, money and family? When you disagree, does it end in understanding or in silence? These questions feel unromantic at nineteen. They feel essential at twenty-six.</p>
<blockquote>The right person will not need you to disappear to make room for them.</blockquote>
<p>If you are in something that costs you your peace, you are allowed to leave. Leaving is not failure. Sometimes it is the most faithful thing you will ever do.</p>`,
  },
  {
    title: 'You Were Not an Accident', topic: 'purpose', tags: ['purpose', 'identity'],
    content: `<p>Nothing useful falls from the sky. Every product you own was designed by someone who knew exactly what it was for, and wrote a manual so you would know too.</p>
<p>So why do we spend so many years guessing what we are for?</p>
<h2>Start with the maker</h2>
<p>When I felt lost in my second year, watching classmates win scholarships and start businesses, I kept asking people what I should do with my life. Lecturers, friends, aunties. Everyone had an opinion. Very few had an answer.</p>
<p>The answer started to come when I stopped asking people and started asking the One who made me. Not in a dramatic way. In quiet mornings, in journals, in noticing what made me come alive and what drained me.</p>
<blockquote>Before I formed you, I knew you. That sentence has carried me through more seasons than I can count.</blockquote>
<p>You are not behind. You are being formed. Ask the Maker for the manual.</p>`,
  },
  {
    title: 'How I Got My First Job Without Connections', topic: 'career', tags: ['career', 'nysc', 'first job'],
    content: `<p>I graduated at twenty with a good result and absolutely no idea how to get a job. Everyone said you need connections. I didn’t have any. Here is what I had instead, and what I did with it.</p>
<h2>I made my work visible</h2>
<p>During service year, I started managing social media for a small church and a bakery near my place of primary assignment. I didn’t earn much. But I had something to show, and showing beats telling every single time.</p>
<h2>I asked for advice, not favours</h2>
<p>When I reached out to people in the industry, I never asked for a job. I asked how they started. People love telling their story, and two of those conversations turned into referrals.</p>
<ul><li>Build one small portfolio before you graduate.</li><li>Learn one tool really well.</li><li>Follow up. Most people don’t.</li></ul>
<p>It took eleven months. There were tears. But the door opened, and I walked through it knowing exactly how I got there.</p>`,
  },
  {
    title: 'The First Yes I Ever Said', topic: 'faith', tags: ['faith', 'salvation', 'testimony'],
    content: `<p>I grew up in church. I knew the songs, the verses and when to stand up. What I didn’t have was a relationship. I had a routine.</p>
<p>It changed in a season I didn’t expect, when I was more interested in being liked than being known.</p>
<h2>A quiet invitation</h2>
<p>There was no altar call. Just a growing restlessness, a sense that I was being invited to something deeper and I kept saying “later.” Later turned into a year of losing my peace.</p>
<blockquote>Every other yes in my life became possible because I said this one first.</blockquote>
<p>If you have been putting off that conversation with God, consider this your gentle nudge. He is not waiting to scold you. He is waiting to welcome you.</p>`,
  },
  {
    title: 'Surviving Your First Semester Budget', topic: 'campus-life', tags: ['money', 'first year', 'campus life'],
    content: `<p>My allowance for my first semester lasted exactly five weeks. The remaining eleven were a masterclass in garri, gratitude and creative maths.</p>
<h2>The rules I wish I’d known</h2>
<ol><li>Pay for the non-negotiables first: hostel, handouts, transport home.</li><li>Split what is left by weeks, not months.</li><li>Cook with friends. It is cheaper, and you will need them during exams anyway.</li><li>Give something, even small. Generosity keeps your heart from getting tight.</li></ol>
<p>Money will always feel short at some point in school. Planning won’t make you rich, but it will make you calm, and calm is worth a lot.</p>`,
  },
];

(async () => {
  await connectDB(process.env.MONGODB_URI);
  await ensureAdmin();
  const cats = Object.fromEntries((await Category.find()).map((c) => [c.slug, c]));
  let i = 0;
  for (const s of STORIES) {
    const slug = slugify(s.title);
    if (await Post.exists({ slug })) { console.log(`skip: ${s.title}`); continue; }
    const content = clean(s.content);
    const plainText = toPlainText(content);
    const cat = cats[s.topic];
    await Post.create({
      title: s.title, slug, content, plainText, excerpt: makeExcerpt(plainText),
      readingTime: readingTime(plainText), tags: s.tags, featured: !!s.featured, status: 'published',
      category: cat?._id, coverImage: await cover(cat?.color || '#3B2A86', ++i), coverAlt: '',
      publishedAt: new Date(Date.now() - i * 6 * 864e5), views: Math.round(40 + Math.random() * 400),
    });
    console.log(`added: ${s.title}`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

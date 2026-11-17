import { readFile, writeFile } from 'node:fs/promises';

const HAR_PATH = 'tests/mocks/articles.har';
const har = JSON.parse(await readFile(HAR_PATH, 'utf-8'));
const articleEntry = har.log.entries.find((entry: any) =>
  entry.request.url.includes('/api/articles?'),
);

if (!articleEntry) {
  throw new Error('Articles request not found in HAR');
}

const articlesData = JSON.parse(articleEntry.response.content.text);

articlesData.articles[0].title = 'ЭТУ СТАТЬЮ ПОДСУНУЛ PLAYWRIGHT HAR 😎';

articleEntry.response.content.text = JSON.stringify(articlesData);
await writeFile(HAR_PATH, JSON.stringify(har, null, 2), 'utf-8');

import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = 'tests/mocks/articles.har';
const targetPath = 'tests/mocks/articles-without-articles.har';

const har = JSON.parse(await readFile(sourcePath, 'utf-8'));

har.log.entries = har.log.entries.filter(
  (entry: any) => !entry.request.url.includes('/api/articles?'),
);

await writeFile(targetPath, JSON.stringify(har, null, 2), 'utf-8');

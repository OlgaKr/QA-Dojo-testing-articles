import { test } from '../fixtures/api-fixtures';
import { fillForm, submitButton } from '../functions-arrays/article-helpers';
import { expect } from '@playwright/test';

test('article', async ({ page, login }) => {
  const promiseResponse = page.waitForResponse('**/api/articles');
  const promiseRequest = page.waitForRequest('**/api/articles');

  await page.goto('');
  fillForm(page);
  await submitButton(page);

  const request = await promiseRequest;
  const response = await promiseResponse;

  const jsonResponse = await response.json();
  const jsonRequest = request.postDataJSON();
  console.log(jsonResponse);
  console.log(jsonResponse.article.slug);
  console.log(jsonRequest);
});

test('article.on', async ({ page, login }) => {
  let responseCounter = 0;
  page.on('response', async (response) => {
    if (response.url().includes('/api/articles')) {
      responseCounter++;
      console.log(responseCounter);
      console.log('This is response data: ');
      console.log(await response.json());
    }
  });

  let requestCounter = 0;
  page.on('request', async (request) => {
    if (request.url().includes('/api/articles')) {
      requestCounter++;
      console.log(requestCounter);
      console.log('This is request data: ');
      console.log(request.url());
    }
  });

  await page.goto('');
  fillForm(page);
  await submitButton(page);
});

test('список статей не загружается, если запрос оборван', async ({ page }) => {
  let abortedCount = 0;

  await page.route('**/api/articles?**', async (route, request) => {
    if (request.method() === 'GET') {
      abortedCount++;
      console.log('ABORT:', request.url());
      await route.abort();
    } else {
      await route.continue();
    }
  });

  await page.goto('http://104.168.59.50/articles');
  await page.waitForTimeout(3000);
});

test('сайт остаётся рабочим без картинок', async ({ page }) => {
  let blockedCount = 0;

  await page.route(/\.(jpe?g|png|webp)(\?.*)?$/i, async (route) => {
    blockedCount++;
    await route.abort();
  });

  await page.goto('https://rozetka.com.ua/');
  await page.waitForTimeout(5000);
});

test('finance', async ({ page }) => {
  await page.route('**/ua/osago/polis-oscpv-vid-**', async (route, request) => {
    if (request.headers()['rsc'] !== '1') {
      return route.continue();
    }

    const response = await route.fetch();
    let body = await response.text();
    body = body.replaceAll('Гардіан', 'TEST INSURER');

    console.log(`This is response: ${response}`);
    console.log('------------------------------------------------------------');
    console.log(`This is body: ${body}`);

    const headers = { ...response.headers() };
    delete headers['content-length'];
    delete headers['content-encoding'];
    console.log('------------------------------------------------------------');
    console.log(`These are headers: ${headers}`);

    await route.fulfill({
      response,
      body,
      headers,
      contentType: 'text/x-component',
    });
  });

  await page.goto(
    'https://hotline.finance/ua/osago/offers#stateNumber=%D0%A5%D0%902080&autoCategoryGroup=B&autoCategory=B1&registrationPlace=14&temporaryPeriod=13',
  );

  await page.waitForTimeout(5000);
});

test('finance2', async ({ page }) => {
  // для отладки: смотрим, какие запросы вообще идут
  page.on('request', (req) =>
    console.log('>>', req.method(), req.url(), 'rsc =', req.headers()['rsc']),
  );

  await page.route('**/ua/osago/polis-oscpv-vid-**', async (route, request) => {
    console.log('HANDLER:', request.method(), request.url());

    if (request.headers()['rsc'] !== '1') {
      return route.continue();
    }

    const response = await route.fetch();
    let body = await response.text();
    body = body.replaceAll('Гардіан', 'TEST INSURER');

    const headers = { ...response.headers() };
    delete headers['content-length'];
    delete headers['content-encoding'];

    console.log('headers:', JSON.stringify(headers, null, 2));
    console.log('body (первые 500 символов):', body.slice(0, 500));

    await route.fulfill({
      response,
      body,
      headers,
      contentType: 'text/x-component',
    });
  });

  await page.goto(
    'https://hotline.finance/ua/osago/offers#stateNumber=%D0%A5%D0%902080&autoCategoryGroup=B&autoCategory=B1&registrationPlace=14&temporaryPeriod=13',
  );

  // временно, чтобы успеть посмотреть глазами и дождаться запросов
  await page.waitForTimeout(100000);
});

test('find where Гардіан comes from', async ({ page }) => {
  page.on('response', async (res) => {
    try {
      const type = res.headers()['content-type'] ?? '';
      if (!/json|html|text|x-component/.test(type)) return;

      const text = await res.text();
      if (
        text.includes('Гардіан') ||
        text.includes('\\u0413\\u0430\\u0440\\u0434')
      ) {
        console.log('FOUND IN:', res.request().method(), res.url());
        console.log('  content-type:', type);
        console.log('  rsc header:', res.request().headers()['rsc']);
      }
    } catch {
      // у некоторых ответов (редиректы, потоки) тело недоступно, это нормально
    }
  });

  await page.goto(
    'https://hotline.finance/ua/osago/offers#stateNumber=%D0%A5%D0%902080&autoCategoryGroup=B&autoCategory=B1&registrationPlace=14&temporaryPeriod=13',
  );
  await page.waitForTimeout(10000);
});

test.only('finance: подмена названия страховой', async ({ page }) => {
  let replacedCount = 0;

  await page.route(
    (url) => url.pathname === '/api/insurance/osago/search',
    async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      //console.log('These are headers:', response.headers());
      //console.log('headers:', JSON.stringify(response.headers(), null, 2));
      //console.log('This is body: ', body);

      if (body.includes('Гардіан')) {
        body = body.replaceAll('Гардіан', 'TEST INSURER');
        replacedCount++;
      }

      const headers = { ...response.headers() };
      delete headers['content-length'];
      delete headers['content-encoding'];

      //console.log('These are headers: ', headers);

      await route.fulfill({
        response,
        body,
        headers,
        contentType: 'application/json',
      });
    },
  );

  const searchResponse = page.waitForResponse((res) =>
    res.url().includes('/api/insurance/osago/search'),
  );

  await page.goto(
    'https://hotline.finance/ua/osago/offers#stateNumber=%D0%A5%D0%902080&autoCategoryGroup=B&autoCategory=B1&registrationPlace=14&temporaryPeriod=13',
  );

  const searchResult = await searchResponse;
  console.log('This is searchResult: ', searchResult);
  const searchBody = await searchResult.text();
  //console.log('This is search Response: ', searchBody);

  await page.waitForTimeout(2000);
});

test('User can update avatar', async ({ page }) => {
  test.skip(true, 'Bug APP-123: avatar is not saved');

  // Остальные действия теста
});

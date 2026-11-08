import type { APIRequestContext } from '@playwright/test';

export class ArticleController {
  constructor(private request: APIRequestContext) {}

  async createArticle(body: {
    article: {
      title: string;
      description: string;
      body: string;
      tagList: string[];
    };
  }) {
    const response = await this.request.post('/api/articles', {
      data: body,
      failOnStatusCode: true,
    });

    return await response.json();
  }

  async deleteArticle(slug: string) {
    const response = await this.request.delete(
      `/api/articles/${encodeURIComponent(slug)}`,
      {
        failOnStatusCode: true,
      },
    );

    return response;
  }
}

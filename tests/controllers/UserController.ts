import { APIRequestContext, expect } from '@playwright/test';

export interface CreateUserRequest {
  user: {
    username: string;
    email: string;
    password: string;
  };
}

export interface UserResponse {
  user: {
    email: string;
    username: string;
    bio: string;
    image: string;
    token: string;
  };
}

export class UserController {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async createUser(body: CreateUserRequest): Promise<UserResponse> {
    const response = await this.request.post('/api/users', {
      data: body,
      failOnStatusCode: true,
    });

    expect(response.status()).toBe(201);
    return response.json();
  }
}

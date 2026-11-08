import type { APIRequestContext } from '@playwright/test';

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
  constructor(private request: APIRequestContext) {}

  async createUser(body: CreateUserRequest): Promise<UserResponse> {
    const response = await this.request.post('/api/users', {
      data: body,
      failOnStatusCode: true,
    });

    return response.json();
  }

  async loginAsUser(email: string, password: string): Promise<string> {
    const response = await this.request.post('/api/users/login', {
      data: {
        user: { email, password },
      },
      failOnStatusCode: true,
    });

    const json: UserResponse = await response.json();

    return json.user.token;
  }
}

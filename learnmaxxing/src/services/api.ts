// API configuration and base service
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV 
    ? '/api' // Use proxy in development
    : '/api' // Use relative paths in production
);

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  group_id?: number;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_json: {
    question: string;
    answerOptions: {
      A: string;
      B: string;
      C: string;
    };
    correctAnswer: string;
  };
  explanation: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
}

class ApiService {
  private baseUrl: string;
  private credentials: { username: string; password: string } | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load stored credentials
    const storedCreds = localStorage.getItem('userCredentials');
    if (storedCreds) {
      this.credentials = JSON.parse(storedCreds);
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Construct URL - remove duplicate '/api' if it already exists in endpoint
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add basic auth header if we have credentials
    if (this.credentials) {
      const authToken = btoa(`${this.credentials.username}:${this.credentials.password}`);
      config.headers = {
        ...config.headers,
        'Authorization': `Basic ${authToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return response.text() as unknown as T;
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  // Auth methods
  async register(username: string, password: string): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async login(username: string, password: string): Promise<{ message: string; user: User }> {
    const result = await this.request<{ message: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Store credentials for basic auth
    this.credentials = { username, password };
    localStorage.setItem('userCredentials', JSON.stringify(this.credentials));
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  }

  logout(): void {
    this.credentials = null;
    localStorage.removeItem('userCredentials');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  // Protected user endpoints
  async getProfile(): Promise<User> {
    return this.request<User>('/api/protected/profile');
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/api/protected/users');
  }

  // Quiz endpoints
  async getQuizzes(): Promise<Quiz[]> {
    return this.request<Quiz[]>('/quizzes');
  }

  // Groups endpoints
  async getGroups(): Promise<Group[]> {
    return this.request<Group[]>('/groups');
  }

  async getGroup(groupId: number): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}`);
  }

  async getGroupQuizzes(groupId: number): Promise<Quiz[]> {
    return this.request<Quiz[]>(`/groups/${groupId}/quizzes`);
  }

  async createQuiz(title: string, description: string, groupId: number): Promise<Quiz> {
    return this.request<Quiz>('/api/protected/quizzes', {
      method: 'POST',
      body: JSON.stringify({ title, description, group_id: groupId }),
    });
  }

  async getQuizQuestions(quizId: number): Promise<Question[]> {
    return this.request<Question[]>(`/api/protected/quizzes/${quizId}/questions`);
  }

  // Quiz generation endpoints
  async generateTopicsAndQuizzes(prompt: string): Promise<any> {
    return this.request<any>('/api/quiz/generate-topics-and-quizzes', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async analyzeContentAndSuggest(contents: string[]): Promise<any> {
    return this.request<any>('/api/quiz/analyze-content-and-suggest', {
      method: 'POST',
      body: JSON.stringify({ contents }),
    });
  }

  async generateQuestions(selections: any[]): Promise<any> {
    return this.request<any>('/api/quiz/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ selections }),
    });
  }

  // Assessment endpoints
  async submitTopicFailureData(data: Array<{ questionId: number; success: boolean; topicId: number }>): Promise<any> {
    return this.request<any>('/api/topics/failure-percentage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL);

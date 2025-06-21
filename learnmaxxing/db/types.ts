// Database entity types

export interface User {
  id: number;
  username: string;
  password?: string;
  created_at: string;
}

export interface NewUser {
  username: string;
  password?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  created_at: string;
}

export interface NewQuiz {
  title: string;
  description?: string;
  group_id: number;
}

export interface UserQuiz {
  id: number;
  user_id: number;
  quiz_id: number;
  started_at?: string;
  completed_at?: string;
}

export interface NewUserQuiz {
  user_id: number;
  quiz_id: number;
  started_at?: string;
  completed_at?: string;
}

export interface Reference {
  id: number;
  title: string | null;
  content: ArrayBuffer;
  created_at: string;
}

export interface NewReference {
  title?: string;
  content: ArrayBuffer;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_json: any; // JSON object
  explanation?: string;
  created_at: string;
}

export interface NewQuestion {
  quiz_id: number;
  question_json: any; // JSON object
  explanation?: string;
}

export interface ReferenceQuestion {
  id: number;
  question_id: number;
  reference_id: number;
  paragraph: string;
}

export interface NewReferenceQuestion {
  question_id: number;
  reference_id: number;
  paragraph: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
}

export interface NewGroup {
  name: string;
}

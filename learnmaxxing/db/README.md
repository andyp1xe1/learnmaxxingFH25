# Repository Layer Documentation

This directory contains a minimal repository layer for interacting with Cloudflare D1 database. The repository layer provides basic CRUD operations for all entities in the database schema.

## Architecture

- **BaseRepository**: Abstract base class that provides common database operations (findMany, findOne, insert, update, delete, transaction)
- **Entity Repositories**: Specific repositories for each database table (User, Quiz, Question, Reference, etc.)
- **Repository Factory**: Centralized factory for creating and managing repository instances
- **Types**: TypeScript interfaces for all database entities

## Usage Example

```typescript
import { createRepositories } from './db';

// In your Cloudflare Worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Create repository factory with D1 database
    const repos = createRepositories(env.DB);
    
    // Use repositories
    const users = await repos.users.findAll();
    const user = await repos.users.create({
      username: 'john_doe',
      email: 'john@example.com',
      password_hash: 'hashed_password'
    });
    
    // Update user
    await repos.users.updateById(user.id, {
      email: 'newemail@example.com'
    });
    
    // Create a quiz
    const quiz = await repos.quizzes.create({
      title: 'Sample Quiz',
      description: 'A sample quiz for testing'
    });
    
    // Add questions to the quiz
    const question = await repos.questions.create({
      quiz_id: quiz.id,
      question_json: {
        type: 'multiple_choice',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correct_answer: 1
      },
      explanation: 'Basic arithmetic: 2 + 2 = 4'
    });
    
    return new Response('Success');
  }
};
```

## Available Repositories

### UserRepository
- `create(userData: NewUser): Promise<User>`
- `findById(id: number): Promise<User | null>`
- `findByUsername(username: string): Promise<User | null>`
- `findByEmail(email: string): Promise<User | null>`
- `findAll(): Promise<User[]>`
- `updateById(id: number, updates: Partial<NewUser>): Promise<boolean>`
- `deleteById(id: number): Promise<boolean>`

### QuizRepository
- `create(quizData: NewQuiz): Promise<Quiz>`
- `findById(id: number): Promise<Quiz | null>`
- `findAll(): Promise<Quiz[]>`
- `findByTitle(title: string): Promise<Quiz[]>`
- `updateById(id: number, updates: Partial<NewQuiz>): Promise<boolean>`
- `deleteById(id: number): Promise<boolean>`

### QuestionRepository
- `create(questionData: NewQuestion): Promise<Question>`
- `findById(id: number): Promise<Question | null>`
- `findByQuizId(quizId: number): Promise<Question[]>`
- `findAll(): Promise<Question[]>`
- `updateById(id: number, updates: Partial<NewQuestion>): Promise<boolean>`
- `deleteById(id: number): Promise<boolean>`
- `deleteByQuizId(quizId: number): Promise<number>`
- `countByQuizId(quizId: number): Promise<number>`

### ReferenceRepository
- `create(referenceData: NewReference): Promise<Reference>`
- `findById(id: number): Promise<Reference | null>`
- `findByQuizId(quizId: number): Promise<Reference[]>`
- `findAll(): Promise<Reference[]>`
- `findByTitle(title: string): Promise<Reference[]>`
- `updateById(id: number, updates: Partial<NewReference>): Promise<boolean>`
- `deleteById(id: number): Promise<boolean>`
- `deleteByQuizId(quizId: number): Promise<number>`

### UserQuizRepository
- `create(userQuizData: NewUserQuiz): Promise<UserQuiz>`
- `findById(id: number): Promise<UserQuiz | null>`
- `findByUserId(userId: number): Promise<UserQuiz[]>`
- `findByQuizId(quizId: number): Promise<UserQuiz[]>`
- `findByUserAndQuiz(userId: number, quizId: number): Promise<UserQuiz | null>`
- `findAll(): Promise<UserQuiz[]>`
- `updateById(id: number, updates: Partial<NewUserQuiz>): Promise<boolean>`
- `deleteById(id: number): Promise<boolean>`
- `markCompleted(userId: number, quizId: number): Promise<boolean>`

### ReferenceQuestionRepository
- `create(data: NewReferenceQuestion): Promise<ReferenceQuestion>`
- `findById(id: number): Promise<ReferenceQuestion | null>`
- `findByQuestionId(questionId: number): Promise<ReferenceQuestion[]>`
- `findByReferenceId(referenceId: number): Promise<ReferenceQuestion[]>`
- `findAll(): Promise<ReferenceQuestion[]>`
- `updateById(id: number, updates: Partial<NewReferenceQuestion>): Promise<boolean>`
- `deleteById(id: number): Promise<boolean>`
- `deleteByQuestionId(questionId: number): Promise<number>`
- `deleteByReferenceId(referenceId: number): Promise<number>`

## Database Schema

The database schema includes the following tables:
- `user`: User accounts with authentication info
- `quiz`: Quiz definitions with title and description
- `user_quiz`: Junction table tracking user quiz attempts
- `reference`: Reference materials (documents, PDFs, etc.) linked to quizzes
- `question`: Quiz questions with JSON-stored question data
- `reference_question`: Links questions to specific reference paragraphs

## Error Handling

All repository methods handle database errors and will throw meaningful error messages. The base repository includes transaction support for atomic operations across multiple tables.

## Extending the Repository

To add new methods to any repository:

1. Add the method to the specific repository class
2. Use the inherited base methods (`findMany`, `findOne`, `insert`, `update`, `delete`)
3. Follow the existing patterns for parameter binding and error handling

Example:
```typescript
// In UserRepository
async findActiveUsers(): Promise<User[]> {
  const query = `
    SELECT u.* FROM user u
    JOIN user_quiz uq ON u.id = uq.user_id
    WHERE uq.completed_at IS NOT NULL
    GROUP BY u.id
  `;
  return this.findMany<User>(query);
}
```

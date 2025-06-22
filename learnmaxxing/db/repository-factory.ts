import type { D1Database } from "@cloudflare/workers-types";
import { UserRepository } from "./user-repository";
import { QuizRepository } from "./quiz-repository";
import { UserQuizRepository } from "./user-quiz-repository";
import { QuestionRepository } from "./question-repository";
import { ReferenceRepository } from "./reference-repository";
import { ReferenceQuestionRepository } from "./reference-question-repository";
import { GroupRepository } from "./group-repository";
import { UserQuestionPerformanceRepository } from "./user-question-performance-repository";

/**
 * Repository factory that provides access to all repository instances
 */
export class RepositoryFactory {
  private db: D1Database;
  
  private _userRepository?: UserRepository;
  private _quizRepository?: QuizRepository;
  private _userQuizRepository?: UserQuizRepository;
  private _questionRepository?: QuestionRepository;
  private _referenceRepository?: ReferenceRepository;
  private _referenceQuestionRepository?: ReferenceQuestionRepository;
  private _groupRepository?: GroupRepository;
  private _userQuestionPerformanceRepository?: UserQuestionPerformanceRepository;

  constructor(db: D1Database) {
    this.db = db;
  }

  get users(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.db);
    }
    return this._userRepository;
  }

  get quizzes(): QuizRepository {
    if (!this._quizRepository) {
      this._quizRepository = new QuizRepository(this.db);
    }
    return this._quizRepository;
  }

  get userQuizzes(): UserQuizRepository {
    if (!this._userQuizRepository) {
      this._userQuizRepository = new UserQuizRepository(this.db);
    }
    return this._userQuizRepository;
  }

  get questions(): QuestionRepository {
    if (!this._questionRepository) {
      this._questionRepository = new QuestionRepository(this.db);
    }
    return this._questionRepository;
  }

  get references(): ReferenceRepository {
    if (!this._referenceRepository) {
      this._referenceRepository = new ReferenceRepository(this.db);
    }
    return this._referenceRepository;
  }

  get referenceQuestions(): ReferenceQuestionRepository {
    if (!this._referenceQuestionRepository) {
      this._referenceQuestionRepository = new ReferenceQuestionRepository(this.db);
    }
    return this._referenceQuestionRepository;
  }

  get groups(): GroupRepository {
    if (!this._groupRepository) {
      this._groupRepository = new GroupRepository(this.db);
    }
    return this._groupRepository;
  }

  get userQuestionPerformance(): UserQuestionPerformanceRepository {
    if (!this._userQuestionPerformanceRepository) {
      this._userQuestionPerformanceRepository = new UserQuestionPerformanceRepository(this.db);
    }
    return this._userQuestionPerformanceRepository;
  }
}

/**
 * Create a repository factory instance
 */
export function createRepositories(db: D1Database): RepositoryFactory {
  return new RepositoryFactory(db);
}

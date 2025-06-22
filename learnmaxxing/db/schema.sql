-- Database schema for learnmaxxing application

-- User table
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- topicGroup table
CREATE TABLE IF NOT EXISTS topic_group (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz table
CREATE TABLE IF NOT EXISTS quiz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  group_id INTEGER NOT NULL,
  FOREIGN KEY (group_id) REFERENCES topic_group(id) ON DELETE CASCADE
);

-- User-Quiz relationship table
CREATE TABLE IF NOT EXISTS user_quiz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  percentage_completed REAL DEFAULT 0.0, -- Percentage completed (0.0 to 100.0)
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (quiz_id) REFERENCES quiz(id),
  UNIQUE(user_id, quiz_id)
);

-- Reference table
CREATE TABLE IF NOT EXISTS reference (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content BLOB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question table
CREATE TABLE IF NOT EXISTS question (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question_json TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- SM2 Spaced Repetition fields
  ef REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetition_count INTEGER DEFAULT 0,
  next_review_date TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);

-- User-Question Performance tracking for SM2
CREATE TABLE IF NOT EXISTS user_question_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  quality INTEGER NOT NULL, -- 1=hard, 3=ok, 5=easy
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (question_id) REFERENCES question(id)
);

-- Reference-Question relationship table
CREATE TABLE IF NOT EXISTS reference_question (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  reference_id INTEGER NOT NULL,
  paragraph TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES question(id),
  FOREIGN KEY (reference_id) REFERENCES reference(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_quiz_user_id ON user_quiz(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_quiz_id ON user_quiz(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_quiz_id ON question(quiz_id);
CREATE INDEX IF NOT EXISTS idx_reference_question_question_id ON reference_question(question_id);
CREATE INDEX IF NOT EXISTS idx_reference_question_reference_id ON reference_question(reference_id);
-- SM2 performance indexes
CREATE INDEX IF NOT EXISTS idx_user_question_performance_user_id ON user_question_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_performance_question_id ON user_question_performance(question_id);
CREATE INDEX IF NOT EXISTS idx_question_next_review_date ON question(next_review_date);

-- Database schema for learnmaxxing application

-- User table
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz table
CREATE TABLE IF NOT EXISTS quiz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Quiz relationship table
CREATE TABLE IF NOT EXISTS user_quiz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (quiz_id) REFERENCES quiz(id),
  UNIQUE(user_id, quiz_id)
);

-- Reference table
CREATE TABLE IF NOT EXISTS reference (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  title TEXT,
  content BLOB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);

-- Question table
CREATE TABLE IF NOT EXISTS question (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question_json TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quiz(id)
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
CREATE INDEX IF NOT EXISTS idx_reference_quiz_id ON reference(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_quiz_id ON question(quiz_id);
CREATE INDEX IF NOT EXISTS idx_reference_question_question_id ON reference_question(question_id);
CREATE INDEX IF NOT EXISTS idx_reference_question_reference_id ON reference_question(reference_id);

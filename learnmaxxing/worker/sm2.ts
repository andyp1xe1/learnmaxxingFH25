/**
 * SM2 (SuperMemo 2) Spaced Repetition Algorithm Implementation
 * 
 * This is a pure implementation of the SM2 algorithm for calculating
 * when to review items based on user performance.
 */

export interface SM2Question {
  id: number;
  ef: number;           // E-Factor (ease factor)
  interval: number;     // Current interval in days
  repetition_count: number; // Number of successful repetitions
  next_review_date?: string; // ISO date string
}

export interface SM2Result {
  question_id: number;
  ef: number;
  interval: number;
  repetition_count: number;
  next_review_date: string;
}

export type Quality = 1 | 3 | 5; // 1=hard, 3=ok, 5=easy

/**
 * Calculate the next review parameters using SM2 algorithm
 * @param question Current question state
 * @param quality User's quality rating (1=hard, 3=ok, 5=easy)
 * @returns Updated question parameters
 */
export function calculateSM2(question: SM2Question, quality: Quality): SM2Result {
  let { ef, interval, repetition_count } = question;
  
  // Calculate new E-Factor
  ef = calculateNewEF(ef, quality);
  
  // Calculate new interval
  const newInterval = calculateNewInterval(interval, repetition_count, ef);
  
  // Update repetition count
  const newRepetitionCount = repetition_count + 1;
  
  // Calculate next review date (current date + interval)
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    question_id: question.id,
    ef,
    interval: newInterval,
    repetition_count: newRepetitionCount,
    next_review_date: nextReviewDate.toISOString()
  };
}

/**
 * Calculate new E-Factor based on quality rating
 * @param currentEF Current E-Factor
 * @param quality Quality rating (1-5)
 * @returns New E-Factor
 */
function calculateNewEF(currentEF: number, quality: Quality): number {
  // SM2 E-Factor calculation
  const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // E-Factor should not go below 1.3
  return Math.max(1.3, newEF);
}

/**
 * Calculate new interval based on repetition count and E-Factor
 * @param currentInterval Current interval
 * @param repetitionCount Current repetition count
 * @param ef E-Factor
 * @returns New interval in days
 */
function calculateNewInterval(currentInterval: number, repetitionCount: number, ef: number): number {
  if (repetitionCount === 0) {
    // First review: 1 day
    return 1;
  } else if (repetitionCount === 1) {
    // Second review: 6 days
    return 6;
  } else {
    // Subsequent reviews: interval * EF
    return Math.round(currentInterval * ef);
  }
}

/**
 * Get questions that are due for review
 * @param questions Array of questions with SM2 data
 * @param userId User ID for filtering (not used in this implementation)
 * @returns Questions due for review
 */
export function getQuestionsDueForReview(questions: SM2Question[], userId: number): SM2Question[] {
  const now = new Date();
  
  return questions.filter(question => {
    // Questions with no next_review_date are new and should be shown
    if (!question.next_review_date) {
      return true;
    }
    
    // Questions due for review (next_review_date <= now)
    const nextReview = new Date(question.next_review_date);
    return nextReview <= now;
  });
}

/**
 * Get overdue questions (past their review date)
 * @param questions Array of questions with SM2 data
 * @returns Overdue questions sorted by how overdue they are
 */
export function getOverdueQuestions(questions: SM2Question[]): SM2Question[] {
  const now = new Date();
  
  return questions
    .filter(question => {
      if (!question.next_review_date) return false;
      const nextReview = new Date(question.next_review_date);
      return nextReview < now;
    })
    .sort((a, b) => {
      const aDate = new Date(a.next_review_date!);
      const bDate = new Date(b.next_review_date!);
      return aDate.getTime() - bDate.getTime(); // Sort by most overdue first
    });
}

/**
 * Get questions due today
 * @param questions Array of questions with SM2 data
 * @returns Questions due today
 */
export function getQuestionsDueToday(questions: SM2Question[]): SM2Question[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return questions.filter(question => {
    if (!question.next_review_date) return true; // New questions
    
    const nextReview = new Date(question.next_review_date);
    return nextReview >= today && nextReview < tomorrow;
  });
}

/**
 * Convert difficulty string to quality number
 * @param difficulty Difficulty string from frontend
 * @returns Quality number for SM2
 */
export function difficultyToQuality(difficulty: 'hard' | 'ok' | 'easy'): Quality {
  switch (difficulty) {
    case 'hard': return 1;
    case 'ok': return 3;
    case 'easy': return 5;
    default: return 3; // Default to 'ok'
  }
}

/**
 * Convert quality number to difficulty string
 * @param quality Quality number from SM2
 * @returns Difficulty string for frontend
 */
export function qualityToDifficulty(quality: Quality): 'hard' | 'ok' | 'easy' {
  switch (quality) {
    case 1: return 'hard';
    case 3: return 'ok';
    case 5: return 'easy';
    default: return 'ok';
  }
} 
import { describe, it, expect } from 'vitest';
import { 
  calculateSM2, 
  getQuestionsDueForReview, 
  getOverdueQuestions, 
  getQuestionsDueToday,
  difficultyToQuality, 
  qualityToDifficulty,
  type SM2Question,
  type Quality 
} from './sm2';

describe('SM2 Algorithm', () => {
  describe('calculateSM2', () => {
    it('should handle first review (repetition_count = 0)', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 0,
        repetition_count: 0,
        next_review_date: undefined
      };

      const result = calculateSM2(question, 3); // OK quality

      expect(result.question_id).toBe(1);
      expect(result.interval).toBe(1); // First review: 1 day
      expect(result.repetition_count).toBe(1);
      expect(result.ef).toBeLessThan(2.5); // EF decreases for OK (quality 3)
      expect(result.next_review_date).toBeDefined();
    });

    it('should handle second review (repetition_count = 1)', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 1,
        repetition_count: 1,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 3); // OK quality

      expect(result.interval).toBe(6); // Second review: 6 days
      expect(result.repetition_count).toBe(2);
    });

    it('should calculate subsequent intervals correctly', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 6,
        repetition_count: 2,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 3); // OK quality

      expect(result.interval).toBe(14); // 6 * 2.36 ≈ 14 (rounded)
      expect(result.repetition_count).toBe(3);
    });

    it('should decrease EF for hard responses (quality = 1)', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 6,
        repetition_count: 2,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 1); // Hard quality

      expect(result.ef).toBeLessThan(2.5); // EF should decrease
      expect(result.ef).toBeGreaterThanOrEqual(1.3); // Minimum EF is 1.3
    });

    it('should increase EF for easy responses (quality = 5)', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 6,
        repetition_count: 2,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 5); // Easy quality

      expect(result.ef).toBeGreaterThan(2.5); // EF should increase
    });

    it('should maintain EF for OK responses (quality = 3)', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 6,
        repetition_count: 2,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 3); // OK quality

      expect(result.ef).toBeCloseTo(2.36, 1); // EF decreases slightly for OK
    });

    it('should not let EF go below 1.3', () => {
      const question: SM2Question = {
        id: 1,
        ef: 1.3,
        interval: 6,
        repetition_count: 2,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 1); // Hard quality

      expect(result.ef).toBeGreaterThanOrEqual(1.3);
    });

    it('should calculate next review date correctly', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 1,
        repetition_count: 1,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const before = new Date();
      const result = calculateSM2(question, 3);
      const after = new Date();

      const nextReview = new Date(result.next_review_date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 6); // 6 days interval

      // Allow for small time differences during test execution
      expect(nextReview.getTime()).toBeGreaterThanOrEqual(expectedDate.getTime() - 1000);
      expect(nextReview.getTime()).toBeLessThanOrEqual(after.getTime() + 6 * 24 * 60 * 60 * 1000);
    });
  });

  describe('difficultyToQuality', () => {
    it('should convert hard to quality 1', () => {
      expect(difficultyToQuality('hard')).toBe(1);
    });

    it('should convert ok to quality 3', () => {
      expect(difficultyToQuality('ok')).toBe(3);
    });

    it('should convert easy to quality 5', () => {
      expect(difficultyToQuality('easy')).toBe(5);
    });
  });

  describe('qualityToDifficulty', () => {
    it('should convert quality 1 to hard', () => {
      expect(qualityToDifficulty(1)).toBe('hard');
    });

    it('should convert quality 3 to ok', () => {
      expect(qualityToDifficulty(3)).toBe('ok');
    });

    it('should convert quality 5 to easy', () => {
      expect(qualityToDifficulty(5)).toBe('easy');
    });
  });

  describe('getQuestionsDueForReview', () => {
    it('should return questions with no next_review_date', () => {
      const questions: SM2Question[] = [
        { id: 1, ef: 2.5, interval: 0, repetition_count: 0, next_review_date: undefined },
        { id: 2, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: '2024-01-01T00:00:00.000Z' }
      ];

      const result = getQuestionsDueForReview(questions, 1);

      expect(result).toHaveLength(2); // Both questions are due (one new, one past due)
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should return questions due for review', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now

      const questions: SM2Question[] = [
        { id: 1, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: pastDate.toISOString() },
        { id: 2, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: futureDate.toISOString() }
      ];

      const result = getQuestionsDueForReview(questions, 1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should return questions due exactly now', () => {
      const now = new Date();

      const questions: SM2Question[] = [
        { id: 1, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: now.toISOString() }
      ];

      const result = getQuestionsDueForReview(questions, 1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('getOverdueQuestions', () => {
    it('should return only overdue questions', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now

      const questions: SM2Question[] = [
        { id: 1, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: pastDate.toISOString() },
        { id: 2, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: futureDate.toISOString() },
        { id: 3, ef: 2.5, interval: 0, repetition_count: 0, next_review_date: undefined }
      ];

      const result = getOverdueQuestions(questions);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should sort overdue questions by date (most overdue first)', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const questions: SM2Question[] = [
        { id: 1, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: oneDayAgo.toISOString() },
        { id: 2, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: twoDaysAgo.toISOString() }
      ];

      const result = getOverdueQuestions(questions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2); // Most overdue first
      expect(result[1].id).toBe(1);
    });
  });

  describe('getQuestionsDueToday', () => {
    it('should return questions due today', () => {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const questions: SM2Question[] = [
        { id: 1, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: todayStart.toISOString() },
        { id: 2, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: todayEnd.toISOString() },
        { id: 3, ef: 2.5, interval: 0, repetition_count: 0, next_review_date: undefined }
      ];

      const result = getQuestionsDueToday(questions);

      expect(result).toHaveLength(2); // Only those scheduled for today (not including midnight tomorrow)
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3); // New questions are included
    });

    it('should not return questions due tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const questions: SM2Question[] = [
        { id: 1, ef: 2.5, interval: 6, repetition_count: 2, next_review_date: tomorrow.toISOString() }
      ];

      const result = getQuestionsDueToday(questions);

      expect(result).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high EF values', () => {
      const question: SM2Question = {
        id: 1,
        ef: 10.0,
        interval: 100,
        repetition_count: 10,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 5); // Easy quality

      expect(result.ef).toBeGreaterThan(10.0);
      expect(result.interval).toBe(1010); // 100 * 10.1 = 1010 (rounded)
    });

    it('should handle very low EF values', () => {
      const question: SM2Question = {
        id: 1,
        ef: 1.3,
        interval: 1,
        repetition_count: 5,
        next_review_date: '2024-01-01T00:00:00.000Z'
      };

      const result = calculateSM2(question, 1); // Hard quality

      expect(result.ef).toBeGreaterThanOrEqual(1.3);
      expect(result.interval).toBe(1); // 1 * 1.3 = 1 (rounded)
    });

    it('should handle zero interval', () => {
      const question: SM2Question = {
        id: 1,
        ef: 2.5,
        interval: 0,
        repetition_count: 0,
        next_review_date: undefined
      };

      const result = calculateSM2(question, 3);

      expect(result.interval).toBe(1); // First review
    });
  });
}); 
export interface FailedQuiz {
  quizId: number | string; // Can be number for real quizzes or string for generated ones
  quizName: string;
  score: number;
  timestamp: string;
  isGenerated?: boolean; // Flag to identify generated quizzes
}

export const failedQuizzesService = {
  addFailedQuizzes(failedQuizzes: FailedQuiz[]): void {
    console.log('🔍 FailedQuizzesService: Adding failed quizzes:', failedQuizzes);
    
    const existingQuizzes = this.getFailedQuizzes();
    console.log('🔍 FailedQuizzesService: Existing quizzes in localStorage:', existingQuizzes);
    
    // Create a map of existing quizzes by quizId for quick lookup
    const existingMap = new Map(existingQuizzes.map(quiz => [quiz.quizId, quiz]));
    
    // Add new quizzes, avoiding duplicates
    failedQuizzes.forEach(quiz => {
      const quizId = typeof quiz.quizId === 'string' ? quiz.quizId : quiz.quizId.toString();
      if (!existingMap.has(quizId)) {
        existingMap.set(quizId, {
          ...quiz,
          quizId: quizId // Ensure consistent string format
        });
        console.log('✅ FailedQuizzesService: Added new failed quiz:', quiz);
      } else {
        console.log('⚠️ FailedQuizzesService: Skipped duplicate quiz:', quiz);
      }
    });
    
    const updatedQuizzes = Array.from(existingMap.values());
    console.log('📦 FailedQuizzesService: Updated quizzes list:', updatedQuizzes);
    
    localStorage.setItem('failedQuizzes', JSON.stringify(updatedQuizzes));
    console.log('💾 FailedQuizzesService: Saved to localStorage');
  },

  getFailedQuizzes(): FailedQuiz[] {
    const stored = localStorage.getItem('failedQuizzes');
    console.log('🔍 FailedQuizzesService: Retrieved from localStorage:', stored);
    
    if (!stored) {
      console.log('📦 FailedQuizzesService: No failed quizzes found in localStorage');
      return [];
    }
    
    try {
      const quizzes = JSON.parse(stored);
      console.log('📦 FailedQuizzesService: Parsed failed quizzes:', quizzes);
      return quizzes;
    } catch (error) {
      console.error('❌ FailedQuizzesService: Error parsing failed quizzes:', error);
      return [];
    }
  },

  removeFailedQuiz(quizId: number | string): void {
    console.log('🔍 FailedQuizzesService: Removing failed quiz:', quizId);
    
    const quizzes = this.getFailedQuizzes();
    const quizIdStr = typeof quizId === 'string' ? quizId : quizId.toString();
    
    const filteredQuizzes = quizzes.filter(quiz => quiz.quizId !== quizIdStr);
    console.log('📦 FailedQuizzesService: Quizzes after removal:', filteredQuizzes);
    
    localStorage.setItem('failedQuizzes', JSON.stringify(filteredQuizzes));
    console.log('💾 FailedQuizzesService: Updated localStorage after removal');
  },

  clearAllFailedQuizzes(): void {
    console.log('🔍 FailedQuizzesService: Clearing all failed quizzes');
    localStorage.removeItem('failedQuizzes');
    console.log('💾 FailedQuizzesService: Cleared localStorage');
  }
}; 
import * as t from 'drizzle-orm/sqlite-core';

const table = t.sqliteTable;

export const user = table('user', {
  id: t.integer().primaryKey().notNull(),
  username: t.text().notNull().unique(),
  password: t.text(),
  createdAt: t.text().default('CURRENT_TIMESTAMP'),
});

export const userGroup = table('user_group', {
    id: t.integer().primaryKey().notNull(),
    userId: t.integer().notNull().references(() => user.id),
    groupId: t.integer().notNull().references(() => group.id),
    createdAt: t.text().default('CURRENT_TIMESTAMP'),
  }, (tbl) => [
    t.unique('uniq_user_group').on(tbl.userId, tbl.groupId),
    t.index('idx_user_group_user_id').on(tbl.userId),
    t.index('idx_user_group_group_id').on(tbl.groupId),
  ]);  

export const group = table('group', {
  id: t.integer().primaryKey().notNull(),
  name: t.text().notNull().unique(),
  createdAt: t.text().default('CURRENT_TIMESTAMP'),
});

export const topic = table('topic', {
  id: t.integer().primaryKey().notNull(),
  title: t.text().notNull(),
  description: t.text(),
  createdAt: t.text().default('CURRENT_TIMESTAMP'),
  groupId: t.integer().notNull().references(() => group.id, { onDelete: 'cascade' }),
});

export const question = table('question', {
  id: t.integer().primaryKey().notNull(),
  quizId: t.integer().notNull().references(() => topic.id),
  questionJson: t.text().notNull(),
  explanation: t.text(),
}, (tbl) => [
  t.index('idx_question_quiz_id').on(tbl.quizId),
]);

export const document = table('document', {
    id: t.integer().primaryKey().notNull(),
    title: t.text(),
    content: t.blob().notNull(),
    createdAt: t.text().default('CURRENT_TIMESTAMP'),
  });  

export const referenceQuestion = table('reference_question', {
    id: t.integer().primaryKey().notNull(),
    questionId: t.integer().notNull().references(() => question.id),
    documentId: t.integer().notNull().references(() => document.id),
    quote: t.text().notNull(),
  }, (tbl) => [
    t.index('idx_reference_question_question_id').on(tbl.questionId),
    t.index('idx_reference_question_document_id').on(tbl.documentId),
  ]);

// export const userQuestionState = table('user_question_state', {
//   id: t.integer().primaryKey().notNull(),
//   userId: t.integer().notNull().references(() => user.id),
//   questionId: t.integer().notNull().references(() => question.id),
//   quality: t.integer().notNull(),
//   reviewDate: t.text().default('CURRENT_TIMESTAMP'),
//   ef: t.real().default(2.5),
//   interval: t.integer().default(0),
//   repetitionCount: t.integer().default(0),
//   nextReviewDate: t.text(),
// }, (tbl) => [
//   t.unique('uniq_user_question').on(tbl.userId, tbl.questionId),
//   t.index('idx_user_question_state_user_id').on(tbl.userId),
//   t.index('idx_user_question_state_question_id').on(tbl.questionId),
//   t.index('idx_user_question_state_next_review_date').on(tbl.nextReviewDate),
// ]);

// export const userTopicProgress = table('user_topic_progress', {
//     id: t.integer().primaryKey().notNull(),
//     userId: t.integer().notNull().references(() => user.id),
//     topicId: t.integer().notNull().references(() => topic.id),
//     startedAt: t.text(),
//     completedAt: t.text(),
//     percentageCompleted: t.real().default(0.0),
//   }, (tbl) => [
//     t.index('idx_user_topic_progress_user_id').on(tbl.userId),
//     t.index('idx_user_topic_progress_topic_id').on(tbl.topicId),
//   ]);  
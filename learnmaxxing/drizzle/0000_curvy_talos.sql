CREATE TABLE `document` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`content` blob NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `question` (
	`id` integer PRIMARY KEY NOT NULL,
	`quizId` integer NOT NULL,
	`questionJson` text NOT NULL,
	`explanation` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`quizId`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_question_quiz_id` ON `question` (`quizId`);--> statement-breakpoint
CREATE TABLE `reference_question` (
	`id` integer PRIMARY KEY NOT NULL,
	`questionId` integer NOT NULL,
	`documentId` integer NOT NULL,
	`paragraph` text NOT NULL,
	FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`documentId`) REFERENCES `document`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_reference_question_question_id` ON `reference_question` (`questionId`);--> statement-breakpoint
CREATE INDEX `idx_reference_question_document_id` ON `reference_question` (`documentId`);--> statement-breakpoint
CREATE TABLE `topic` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`groupId` integer NOT NULL,
	FOREIGN KEY (`groupId`) REFERENCES `topic_group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `topic_group` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topic_group_name_unique` ON `topic_group` (`name`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `user_group` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`groupId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`groupId`) REFERENCES `topic_group`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_group_user_id` ON `user_group` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_user_group_group_id` ON `user_group` (`groupId`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_user_group` ON `user_group` (`userId`,`groupId`);--> statement-breakpoint
CREATE TABLE `user_question_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`questionId` integer NOT NULL,
	`quality` integer NOT NULL,
	`reviewDate` text DEFAULT 'CURRENT_TIMESTAMP',
	`ef` real DEFAULT 2.5,
	`interval` integer DEFAULT 0,
	`repetitionCount` integer DEFAULT 0,
	`nextReviewDate` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_question_state_user_id` ON `user_question_state` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_user_question_state_question_id` ON `user_question_state` (`questionId`);--> statement-breakpoint
CREATE INDEX `idx_user_question_state_next_review_date` ON `user_question_state` (`nextReviewDate`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_user_question` ON `user_question_state` (`userId`,`questionId`);--> statement-breakpoint
CREATE TABLE `user_topic_progress` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`topicId` integer NOT NULL,
	`startedAt` text,
	`completedAt` text,
	`percentageCompleted` real DEFAULT 0,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topicId`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_topic_progress_user_id` ON `user_topic_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_user_topic_progress_topic_id` ON `user_topic_progress` (`topicId`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_user_topic_progress` ON `user_topic_progress` (`userId`,`topicId`);
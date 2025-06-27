CREATE TABLE `group` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_name_unique` ON `group` (`name`);--> statement-breakpoint
DROP TABLE `topic_group`;--> statement-breakpoint
DROP TABLE `user_question_state`;--> statement-breakpoint
DROP TABLE `user_topic_progress`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_topic` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`groupId` integer NOT NULL,
	FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_topic`("id", "title", "description", "createdAt", "groupId") SELECT "id", "title", "description", "createdAt", "groupId" FROM `topic`;--> statement-breakpoint
DROP TABLE `topic`;--> statement-breakpoint
ALTER TABLE `__new_topic` RENAME TO `topic`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_user_group` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`groupId` integer NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_group`("id", "userId", "groupId", "createdAt") SELECT "id", "userId", "groupId", "createdAt" FROM `user_group`;--> statement-breakpoint
DROP TABLE `user_group`;--> statement-breakpoint
ALTER TABLE `__new_user_group` RENAME TO `user_group`;--> statement-breakpoint
CREATE INDEX `idx_user_group_user_id` ON `user_group` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_user_group_group_id` ON `user_group` (`groupId`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_user_group` ON `user_group` (`userId`,`groupId`);--> statement-breakpoint
ALTER TABLE `reference_question` ADD `quote` text NOT NULL;--> statement-breakpoint
ALTER TABLE `reference_question` DROP COLUMN `paragraph`;--> statement-breakpoint
ALTER TABLE `question` DROP COLUMN `createdAt`;
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email'),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  role: text('role').default('Student'),
  headline: text('headline'),
  school: text('school'),
  region: text('region'),
  bio: text('bio'),
  streak: integer('streak').default(1),
  hearts: integer('hearts').default(5),
  maxHearts: integer('max_hearts').default(5),
  xp: integer('xp').default(0),
  gems: integer('gems').default(20),
  coins: integer('coins').default(0),
  level: integer('level').default(1),
  levelSystemVersion: text('level_system_version').default('v3'),
  quizzesCompleted: integer('quizzes_completed').default(0),
  totalCorrect: integer('total_correct').default(0),
  totalQuestions: integer('total_questions').default(0),
  quizMasteryScore: integer('quiz_mastery_score').default(0),
  avatarType: text('avatar_type'),
  avatarIcon: text('avatar_icon'),
  avatarBg: text('avatar_bg'),
  mascotCharacter: text('mascot_character'),
  mascotTheme: text('mascot_theme'),
  equippedAccessory: text('equipped_accessory'),
  unlockedMascots: jsonb('unlocked_mascots').$type<string[]>(),
  unlockedAccessories: jsonb('unlocked_accessories').$type<string[]>(),
  learningGoal: text('learning_goal'),
  hasCustomizedProfile: boolean('has_customized_profile').default(false),
  hasCompletedStarterTutorial: boolean('has_completed_starter_tutorial').default(false),
  badges: jsonb('badges').$type<string[]>(),
  assessmentConfig: jsonb('assessment_config'),
  savedSettings: jsonb('saved_settings'),
  lastActiveDate: text('last_active_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Quizzes table
export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  creatorUid: text('creator_uid').notNull(),
  creatorName: text('creator_name').notNull(),
  creatorRole: text('creator_role'),
  creatorAvatar: text('creator_avatar'),
  creatorLevel: integer('creator_level').default(1),
  creatorAssessmentsCount: integer('creator_assessments_count').default(1),
  isTopCreator: boolean('is_top_creator').default(false),
  quizTitle: text('quiz_title').notNull(),
  summary: text('summary'),
  difficulty: text('difficulty').default('Intermediate'),
  persona: text('persona').default('Student'),
  targetAudience: text('target_audience'),
  questions: jsonb('questions').notNull(),
  studyGuide: jsonb('study_guide'),
  isPublic: boolean('is_public').default(true),
  calculatorEnabled: boolean('calculator_enabled').default(false),
  dictionaryEnabled: boolean('dictionary_enabled').default(false),
  aiVerified: boolean('ai_verified').default(false),
  aiVerificationScore: integer('ai_verification_score').default(0),
  aiVerificationSummary: text('ai_verification_summary'),
  tags: jsonb('tags').$type<string[]>(),
  pedagogicalTopic: text('pedagogical_topic'),
  pedagogicalSubtopic: text('pedagogical_subtopic'),
  sourceText: text('source_text'),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  savesCount: integer('saves_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Quiz History table
export const quizHistory = pgTable('quiz_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  quizId: text('quiz_id'),
  quizTitle: text('quiz_title').notNull(),
  subject: text('subject'),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  percentage: integer('percentage').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  gemsEarned: integer('gems_earned').notNull(),
  timeSpentSeconds: integer('time_spent_seconds').notNull(),
  difficulty: text('difficulty'),
  persona: text('persona'),
  questions: jsonb('questions'),
  answers: jsonb('answers'),
  flaggedQuestionIds: jsonb('flagged_question_ids').$type<number[]>(),
  completedAt: timestamp('completed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Quiz Likes table
export const quizLikes = pgTable('quiz_likes', {
  id: serial('id').primaryKey(),
  quizId: text('quiz_id').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Quiz Saves table
export const quizSaves = pgTable('quiz_saves', {
  id: serial('id').primaryKey(),
  quizId: text('quiz_id').notNull(),
  userId: text('user_id').notNull(),
  quizTitle: text('quiz_title'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Quiz Comments table
export const quizComments = pgTable('quiz_comments', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorPhotoURL: text('author_photo_url'),
  authorRole: text('author_role').default('Student'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Favorites table
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  presetId: text('preset_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Followed Creators table
export const followedCreators = pgTable('followed_creators', {
  id: serial('id').primaryKey(),
  followerId: text('follower_id').notNull(),
  creatorId: text('creator_id').notNull(),
  creatorName: text('creator_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quizzes: many(quizzes),
  history: many(quizHistory),
  likes: many(quizLikes),
  saves: many(quizSaves),
  comments: many(quizComments),
  favorites: many(favorites),
}));

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  likes: many(quizLikes),
  saves: many(quizSaves),
  comments: many(quizComments),
}));

import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  quizzes,
  quizHistory,
  quizLikes,
  quizSaves,
  quizComments,
  favorites,
  followedCreators,
} from './schema.ts';

// 1. User Profile Repository Functions
export async function getOrCreateUser(
  uid: string,
  email?: string,
  displayName?: string,
  photoURL?: string
) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email: email || null,
        displayName: displayName || 'Scholar',
        photoURL: photoURL || null,
        role: 'Student',
        streak: 1,
        hearts: 5,
        maxHearts: 5,
        xp: 0,
        gems: 20,
        coins: 0,
        level: 1,
        levelSystemVersion: 'v3',
        quizzesCompleted: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        quizMasteryScore: 0,
        badges: [],
        lastActiveDate: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email || null,
          displayName: displayName || 'Scholar',
          photoURL: photoURL || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database operation failed. Please try again later.', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const records = await db.select().from(users).where(eq(users.uid, uid));
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('Database getUserProfile failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, updates: Partial<typeof users.$inferInsert>) {
  try {
    const existing = await getUserProfile(uid);
    if (!existing) {
      await getOrCreateUser(
        uid,
        updates.email || undefined,
        updates.displayName || undefined,
        updates.photoURL || undefined
      );
    }

    const updated = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.uid, uid))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database updateUserProfile failed:', error);
    throw new Error('Database update failed. Please try again later.', { cause: error });
  }
}

export async function getLeaderboardUsers() {
  try {
    return await db
      .select({
        id: users.uid,
        name: users.displayName,
        avatar: users.photoURL,
        persona: users.role,
        level: users.level,
        xp: users.xp,
        streak: users.streak,
        totalQuestions: users.totalQuestions,
        totalCorrect: users.totalCorrect,
        quizMasteryScore: users.quizMasteryScore,
        quizzesCompleted: users.quizzesCompleted,
        school: users.school,
        region: users.region,
        badges: users.badges,
      })
      .from(users)
      .orderBy(desc(users.xp))
      .limit(50);
  } catch (error) {
    console.error('Database getLeaderboardUsers failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// 2. Quizzes Repository Functions
export async function getQuizzes() {
  try {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt)).limit(100);
  } catch (error) {
    console.error('Database getQuizzes failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getQuizById(id: string) {
  try {
    const records = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('Database getQuizById failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createQuiz(quizData: typeof quizzes.$inferInsert) {
  try {
    const inserted = await db.insert(quizzes).values(quizData).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database createQuiz failed:', error);
    throw new Error('Database insert failed. Please try again later.', { cause: error });
  }
}

export async function deleteQuiz(quizId: string, creatorUid: string) {
  try {
    // Check ownership
    const existing = await getQuizById(quizId);
    if (!existing) return false;
    if (existing.creatorUid !== creatorUid) {
      throw new Error('Forbidden: Only quiz creator can delete this assessment');
    }

    await db.delete(quizzes).where(eq(quizzes.id, quizId));
    return true;
  } catch (error) {
    console.error('Database deleteQuiz failed:', error);
    throw new Error('Database delete failed. Please try again later.', { cause: error });
  }
}

// 3. Quiz Likes Repository Functions
export async function toggleQuizLike(quizId: string, userId: string) {
  try {
    const existing = await db
      .select()
      .from(quizLikes)
      .where(and(eq(quizLikes.quizId, quizId), eq(quizLikes.userId, userId)));

    let isLikedNow = false;
    if (existing.length > 0) {
      // Remove like
      await db
        .delete(quizLikes)
        .where(and(eq(quizLikes.quizId, quizId), eq(quizLikes.userId, userId)));
      await db
        .update(quizzes)
        .set({
          likesCount: sql`GREATEST(0, ${quizzes.likesCount} - 1)`,
        })
        .where(eq(quizzes.id, quizId));
      isLikedNow = false;
    } else {
      // Add like
      await db.insert(quizLikes).values({ quizId, userId });
      await db
        .update(quizzes)
        .set({
          likesCount: sql`${quizzes.likesCount} + 1`,
        })
        .where(eq(quizzes.id, quizId));
      isLikedNow = true;
    }
    return isLikedNow;
  } catch (error) {
    console.error('Database toggleQuizLike failed:', error);
    throw new Error('Database like toggle failed. Please try again later.', { cause: error });
  }
}

export async function getQuizLikes(quizId: string) {
  try {
    const records = await db.select().from(quizLikes).where(eq(quizLikes.quizId, quizId));
    return records.map((r) => r.userId);
  } catch (error) {
    console.error('Database getQuizLikes failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// 4. Quiz Saves Repository Functions
export async function toggleQuizSave(quizId: string, userId: string, quizTitle?: string) {
  try {
    const existing = await db
      .select()
      .from(quizSaves)
      .where(and(eq(quizSaves.quizId, quizId), eq(quizSaves.userId, userId)));

    let isSavedNow = false;
    if (existing.length > 0) {
      await db
        .delete(quizSaves)
        .where(and(eq(quizSaves.quizId, quizId), eq(quizSaves.userId, userId)));
      await db
        .update(quizzes)
        .set({
          savesCount: sql`GREATEST(0, ${quizzes.savesCount} - 1)`,
        })
        .where(eq(quizzes.id, quizId));
      isSavedNow = false;
    } else {
      await db.insert(quizSaves).values({ quizId, userId, quizTitle: quizTitle || null });
      await db
        .update(quizzes)
        .set({
          savesCount: sql`${quizzes.savesCount} + 1`,
        })
        .where(eq(quizzes.id, quizId));
      isSavedNow = true;
    }
    return isSavedNow;
  } catch (error) {
    console.error('Database toggleQuizSave failed:', error);
    throw new Error('Database save toggle failed. Please try again later.', { cause: error });
  }
}

export async function getUserSavedQuizIds(userId: string) {
  try {
    const records = await db.select().from(quizSaves).where(eq(quizSaves.userId, userId));
    return records.map((r) => r.quizId);
  } catch (error) {
    console.error('Database getUserSavedQuizIds failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// 5. Quiz Comments Repository Functions
export async function getQuizComments(quizId: string) {
  try {
    return await db
      .select()
      .from(quizComments)
      .where(eq(quizComments.quizId, quizId))
      .orderBy(desc(quizComments.createdAt));
  } catch (error) {
    console.error('Database getQuizComments failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function addQuizComment(commentData: typeof quizComments.$inferInsert) {
  try {
    const inserted = await db.insert(quizComments).values(commentData).returning();
    await db
      .update(quizzes)
      .set({
        commentsCount: sql`${quizzes.commentsCount} + 1`,
      })
      .where(eq(quizzes.id, commentData.quizId));
    return inserted[0];
  } catch (error) {
    console.error('Database addQuizComment failed:', error);
    throw new Error('Database comment insert failed. Please try again later.', { cause: error });
  }
}

export async function deleteQuizComment(commentId: string, authorId: string) {
  try {
    const records = await db.select().from(quizComments).where(eq(quizComments.id, commentId));
    if (records.length === 0) return false;
    if (records[0].authorId !== authorId) {
      throw new Error('Forbidden: Only the comment author can delete this comment');
    }

    const quizId = records[0].quizId;
    await db.delete(quizComments).where(eq(quizComments.id, commentId));
    await db
      .update(quizzes)
      .set({
        commentsCount: sql`GREATEST(0, ${quizzes.commentsCount} - 1)`,
      })
      .where(eq(quizzes.id, quizId));
    return true;
  } catch (error) {
    console.error('Database deleteQuizComment failed:', error);
    throw new Error('Database comment delete failed. Please try again later.', { cause: error });
  }
}

// 6. Quiz History Repository Functions
export async function saveQuizHistory(historyData: typeof quizHistory.$inferInsert) {
  try {
    const inserted = await db.insert(quizHistory).values(historyData).returning();
    return inserted[0];
  } catch (error) {
    console.error('Database saveQuizHistory failed:', error);
    throw new Error('Database history insert failed. Please try again later.', { cause: error });
  }
}

export async function getUserQuizHistory(userId: string) {
  try {
    return await db
      .select()
      .from(quizHistory)
      .where(eq(quizHistory.userId, userId))
      .orderBy(desc(quizHistory.createdAt))
      .limit(100);
  } catch (error) {
    console.error('Database getUserQuizHistory failed:', error);
    throw new Error('Database history query failed. Please try again later.', { cause: error });
  }
}

export async function deleteQuizHistory(recordId: string, userId: string) {
  try {
    await db
      .delete(quizHistory)
      .where(and(eq(quizHistory.id, recordId), eq(quizHistory.userId, userId)));
    return true;
  } catch (error) {
    console.error('Database deleteQuizHistory failed:', error);
    throw new Error('Database history delete failed. Please try again later.', { cause: error });
  }
}

export async function clearAllQuizHistory(userId: string) {
  try {
    await db.delete(quizHistory).where(eq(quizHistory.userId, userId));
    return true;
  } catch (error) {
    console.error('Database clearAllQuizHistory failed:', error);
    throw new Error('Database history clear failed. Please try again later.', { cause: error });
  }
}

// 7. Favorites Repository Functions
export async function toggleFavorite(userId: string, presetId: string) {
  try {
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.presetId, presetId)));

    if (existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.presetId, presetId)));
      return false;
    } else {
      await db.insert(favorites).values({ userId, presetId });
      return true;
    }
  } catch (error) {
    console.error('Database toggleFavorite failed:', error);
    throw new Error('Database favorite toggle failed. Please try again later.', { cause: error });
  }
}

export async function getUserFavorites(userId: string) {
  try {
    const records = await db.select().from(favorites).where(eq(favorites.userId, userId));
    return records.map((r) => r.presetId);
  } catch (error) {
    console.error('Database getUserFavorites failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// 8. Followed Creators Repository Functions
export async function toggleFollowCreator(followerId: string, creatorId: string, creatorName?: string) {
  try {
    const existing = await db
      .select()
      .from(followedCreators)
      .where(
        and(eq(followedCreators.followerId, followerId), eq(followedCreators.creatorId, creatorId))
      );

    if (existing.length > 0) {
      await db
        .delete(followedCreators)
        .where(
          and(
            eq(followedCreators.followerId, followerId),
            eq(followedCreators.creatorId, creatorId)
          )
        );
      return false;
    } else {
      await db
        .insert(followedCreators)
        .values({ followerId, creatorId, creatorName: creatorName || null });
      return true;
    }
  } catch (error) {
    console.error('Database toggleFollowCreator failed:', error);
    throw new Error('Database follow toggle failed. Please try again later.', { cause: error });
  }
}

export async function getFollowedCreators(userId: string) {
  try {
    const records = await db
      .select()
      .from(followedCreators)
      .where(eq(followedCreators.followerId, userId));
    return records.map((r) => r.creatorId);
  } catch (error) {
    console.error('Database getFollowedCreators failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

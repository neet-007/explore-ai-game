"use server";

import { db } from "@/db";
import {
    roundOneQuestionsTable,
    roundTwoQuestionsTable,
    leaderboardTable
} from "@/db/schema";
import { desc } from "drizzle-orm";
import { unstable_cache, revalidateTag } from "next/cache";

export const getQuizQuestions = unstable_cache(
    async () => {
        const [roundOne, roundTwo] = await Promise.all([
            db.select({
                id: roundOneQuestionsTable.id,
                option_a: roundOneQuestionsTable.option_a_url,
                option_b: roundOneQuestionsTable.option_b_url,
            }).from(roundOneQuestionsTable),

            db.select({
                id: roundTwoQuestionsTable.id,
                url: roundTwoQuestionsTable.url,
                type: roundTwoQuestionsTable.type,
            }).from(roundTwoQuestionsTable),
        ]);

        return { roundOne, roundTwo };
    },
    ["quiz-questions-key"],
    { tags: ["quiz-questions"] }
);

export const getQuizQuestionsAndAnswers = unstable_cache(
    async () => {
        const [roundOne, roundTwo] = await Promise.all([
            db.select({
                id: roundOneQuestionsTable.id,
                option_a: roundOneQuestionsTable.option_a_url,
                option_b: roundOneQuestionsTable.option_b_url,
                correct_choice: roundOneQuestionsTable.correct_choice,
            }).from(roundOneQuestionsTable),

            db.select({
                id: roundTwoQuestionsTable.id,
                url: roundTwoQuestionsTable.url,
                is_ai_generated: roundTwoQuestionsTable.is_ai_generated,
            }).from(roundTwoQuestionsTable),
        ]);

        return { roundOne, roundTwo };
    },
    ["quiz-questions-and-answers-key"],
    { tags: ["quiz-questions-and-answers"] }
);

export async function verifyAnswer(
    round: 1 | 2,
    questionId: number,
    userChoice: number | boolean
) {
    if (round === 1) {
        const questions = await getQuizQuestionsAndAnswers();
        const question = questions.roundOne.find((q) => q.id === questionId);

        return question?.correct_choice === userChoice;
    } else {
        const questions = await getQuizQuestionsAndAnswers();
        const question = questions.roundTwo.find((q) => q.id === questionId);

        return question?.is_ai_generated === userChoice;
    }
}

type UserSubmission = {
    userName: string;
    roundOne: { id: number; choice: number }[];
    roundTwo: { id: number; isAi: boolean }[];
};

export async function submitFinalScore(data: UserSubmission) {
    let totalScore = 0;

    const r1Ids = data.roundOne.map((q) => q.id);
    if (r1Ids.length > 0) {
        const r1DataPromise = await getQuizQuestionsAndAnswers();
        const r1Data = r1DataPromise.roundOne;

        data.roundOne.forEach((userAns) => {
            const actual = r1Data.find((q) => q.id === userAns.id);
            if (actual && actual.correct_choice === userAns.choice) totalScore++;
        });
    }

    const r2Ids = data.roundTwo.map((q) => q.id);
    if (r2Ids.length > 0) {
        const r2DataPromise = await getQuizQuestionsAndAnswers();
        const r2Data = r2DataPromise.roundTwo;

        data.roundTwo.forEach((userAns) => {
            const actual = r2Data.find((q) => q.id === userAns.id);
            if (actual && actual.is_ai_generated === userAns.isAi) totalScore++;
        });
    }

    const [record] = await db.insert(leaderboardTable).values({
        name: data.userName,
        score: totalScore,
    }).returning();

    return { success: true, finalScore: totalScore, recordId: record.id };
}

export async function revalidateQuizData() {
    revalidateTag("quiz-questions", "max");
    revalidateTag("quiz-questions-and-answers", "max");
}

export async function getLeaderboard() {
    try {
        const data = await db
            .select({
                id: leaderboardTable.id,
                name: leaderboardTable.name,
                score: leaderboardTable.score,
            })
            .from(leaderboardTable)
            .orderBy(desc(leaderboardTable.score))
            .limit(100);

        return data;
    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        return [];
    }
}

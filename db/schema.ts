import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const roundOneQuestionsTable = sqliteTable("round_one_questions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    option_a_url: text("option_a_url").notNull(),
    option_b_url: text("option_b_url").notNull(),
    correct_choice: integer("correct_choice").notNull(),
});

export const roundTwoQuestionsTable = sqliteTable("round_two_questions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    url: text("url").notNull(),
    type: text("type").notNull(),
    is_ai_generated: integer("is_ai_generated", { mode: "boolean" }).default(false),
});

export const leaderboardTable = sqliteTable("leaderboard", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    score: integer("score").notNull(),
});

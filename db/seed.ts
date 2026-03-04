import { db } from "./index";
import { roundOneQuestionsTable, roundTwoQuestionsTable } from "./schema";

async function seed() {
    console.log("Emptying existing data...");
    await db.delete(roundOneQuestionsTable);
    await db.delete(roundTwoQuestionsTable);

    console.log("Seeding Round 1...");
    await db.insert(roundOneQuestionsTable).values([
        {
            option_a_url: "/round1/1-AI.jpg",
            option_b_url: "/round1/1-NoAI.jpg",
            correct_choice: 1,
        },
        {
            option_a_url: "/round1/2-NotAI.jpg",
            option_b_url: "/round1/2-AI.jpg",
            correct_choice: 2,
        },
    ]);

    console.log("Seeding Round 2...");
    await db.insert(roundTwoQuestionsTable).values([
        {
            url: "/round2/AI-1.webp",
            type: "image",
            is_ai_generated: true,
        },
        {
            url: "/round2/AI-2.webp",
            type: "image",
            is_ai_generated: false,
        },
        {
            url: "/round2/AI-3.mp4",
            type: "video",
            is_ai_generated: true,
        },
    ]);

    console.log("✅ Seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});

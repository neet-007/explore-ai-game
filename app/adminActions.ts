"use server";

import { db } from "@/db";
import { roundOneQuestionsTable, roundTwoQuestionsTable } from "@/db/schema";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

// Simple Session Check
export async function checkAdminSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    return session === "authenticated";
}

export async function loginAdmin(formData: FormData) {
    const user = formData.get("username");
    const pass = formData.get("password");

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
        });
        return { success: true };
    }
    return { success: false, error: "Invalid Credentials" };
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
}

// Database Inserters
export async function addQuestions(round: 1 | 2, data: any[]) {
    const isAuthenticated = await checkAdminSession();
    if (!isAuthenticated) throw new Error("Unauthorized");

    try {
        if (round === 1) {
            await db.insert(roundOneQuestionsTable).values(data);
        } else {
            await db.insert(roundTwoQuestionsTable).values(data);
        }

        // Purge the cache so players see new questions immediately
        revalidateTag("quiz-questions", "max");
        return { success: true, count: data.length };
    } catch (err) {
        console.error(err);
        return { success: false, error: "Database Insert Failed" };
    }
}

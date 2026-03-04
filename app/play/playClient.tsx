"use client";

import { useEffect, useState } from "react";
import {
    getQuizQuestions,
    verifyAnswer,
    submitFinalScore,
} from "@/app/actions";
import Link from "next/link";

type RoundOneQuestion = {
    id: number;
    option_a: string;
    option_b: string;
};

type RoundTwoQuestion = {
    id: number;
    url: string;
    type: "video" | "image";
};

const ROUND_1_TIME = 30;
const ROUND_2_TIME = 60;

export default function PlayClient() {
    const [username, setUsername] = useState("");
    const [started, setStarted] = useState(false);

    const [round, setRound] = useState<1 | 2>(1);
    const [roundEnded, setRoundEnded] = useState(false);

    const [roundOneQuestions, setRoundOneQuestions] = useState<RoundOneQuestion[]>([]);
    const [roundTwoQuestions, setRoundTwoQuestions] = useState<RoundTwoQuestion[]>([]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const [selected, setSelected] = useState<number | boolean | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const [localScore, setLocalScore] = useState(0);
    const [timer, setTimer] = useState(ROUND_1_TIME);

    const [answersRoundOne, setAnswersRoundOne] = useState<
        { id: number; choice: number }[]
    >([]);
    const [answersRoundTwo, setAnswersRoundTwo] = useState<
        { id: number; isAi: boolean }[]
    >([]);

    const [finalScore, setFinalScore] = useState<number | null>(null);

    // Load questions
    useEffect(() => {
        async function load() {
            const data = await getQuizQuestions();
            setRoundOneQuestions(data.roundOne);
            setRoundTwoQuestions(data.roundTwo);
        }
        load();
    }, []);

    // Round-based timer
    useEffect(() => {
        if (!started || finalScore !== null || roundEnded) return;

        if (timer <= 0) {
            if (round === 1) {
                setRoundEnded(true);
            } else {
                finishGame();
            }
            return;
        }

        const interval = setInterval(() => {
            setTimer((t) => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, started, round, finalScore, roundEnded]);

    async function handleAnswer(choice: number | boolean) {
        if (selected !== null) return;

        setSelected(choice);

        const question =
            round === 1
                ? roundOneQuestions[currentIndex]
                : roundTwoQuestions[currentIndex];

        const correct = await verifyAnswer(round, question.id, choice);
        setIsCorrect(!!correct);

        if (correct) setLocalScore((s) => s + 1);

        if (round === 1) {
            setAnswersRoundOne((prev) => [...prev, { id: question.id, choice: choice as number }]);
        } else {
            setAnswersRoundTwo((prev) => [...prev, { id: question.id, isAi: choice as boolean }]);
        }
    }

    async function handleNext() {
        const questions = round === 1 ? roundOneQuestions : roundTwoQuestions;

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((i) => i + 1);
            setSelected(null);
            setIsCorrect(null);
        } else {
            if (round === 1) {
                setRoundEnded(true);
            } else {
                finishGame();
            }
        }
    }

    async function finishGame() {
        const result = await submitFinalScore({
            userName: username,
            roundOne: answersRoundOne,
            roundTwo: answersRoundTwo,
        });

        setFinalScore(result.finalScore);
    }

    function startRoundTwo() {
        setRound(2);
        setCurrentIndex(0);
        setSelected(null);
        setIsCorrect(null);
        setTimer(ROUND_2_TIME);
        setRoundEnded(false);
    }

    // Username screen
    if (!started) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-96 p-8 rounded-2xl shadow-lg border bg-white dark:bg-neutral-900">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                        Enter Username
                    </h1>
                    <input
                        className="border w-full p-2 rounded mb-4 bg-transparent text-neutral-900 dark:text-white"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        disabled={!username.trim()}
                        onClick={() => setStarted(true)}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-neutral-400 transition"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        );
    }

    // Round 1 End Screen
    if (roundEnded && round === 1) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Round 1 Complete
                </h1>
                <div className="text-lg">
                    Current Score:{" "}
                    <span className="font-bold text-blue-600">{localScore}</span>
                </div>
                <button
                    onClick={startRoundTwo}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition"
                >
                    Start Round 2
                </button>
            </div>
        );
    }

    // Final Score Screen
    if (finalScore !== null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Final Score
                </h1>
                <div className="text-5xl font-extrabold text-blue-600">
                    {finalScore}
                </div>

                <div className="flex gap-4">
                    <Link
                        href="/leaderboard"
                        className="px-8 py-4 bg-slate-800 text-white font-bold rounded-full border border-slate-700 hover:bg-slate-700 transition-all duration-300 text-center"
                    >
                        Leaderboard
                    </Link>
                    <Link
                        href="/play"
                        className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 text-center shadow-lg hover:shadow-green-500/20"
                    >
                        Play Again
                    </Link>
                </div>
            </div>
        );
    }

    const questions = round === 1 ? roundOneQuestions : roundTwoQuestions;
    const totalQuestions = questions.length;

    const progress =
        totalQuestions === 0
            ? 0
            : (currentIndex / totalQuestions) * 100;

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    const isVideo =
        round === 2 && currentQuestion.type === "video";

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between mb-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                    <div>Round {round}</div>
                    <div className="text-blue-600">Score: {localScore}</div>
                    <div className={timer <= 10 ? "text-red-600" : ""}>
                        Time: {timer}s
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full mb-6">
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        <span>
                            Question {currentIndex + 1} / {totalQuestions}
                        </span>
                        <span>{Math.round(progress)}%</span>
                    </div>

                    <div className="w-full h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Round 1 */}
                {/* Round 1 */}
                {round === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                        {[1, 2].map((opt) => {
                            const url =
                                opt === 1
                                    ? currentQuestion.option_a
                                    : currentQuestion.option_b;

                            const ring =
                                selected === opt
                                    ? isCorrect
                                        ? "ring-4 ring-green-500"
                                        : "ring-4 ring-red-500"
                                    : "hover:ring-2 hover:ring-indigo-400";

                            return (
                                <div
                                    key={opt}
                                    className={`w-full max-w-md cursor-pointer transition ${ring}`}
                                    onClick={() => handleAnswer(opt)}
                                >
                                    <img
                                        src={url}
                                        className="w-full h-64 object-cover rounded-xl"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Round 2 */}
                {/* Round 2 */}
                {round === 2 && (
                    <div className="flex flex-col items-center gap-6">
                        {isVideo ? (
                            <video
                                src={currentQuestion.url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="rounded-xl w-full max-w-3xl max-h-[70vh] object-contain"
                            />
                        ) : (
                            <img
                                src={currentQuestion.url}
                                alt="Question"
                                className="rounded-xl w-full max-w-3xl max-h-[70vh] object-contain"
                            />
                        )}

                        <div className="flex gap-6 flex-wrap justify-center">
                            <button
                                onClick={() => handleAnswer(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
                            >
                                AI Generated
                            </button>

                            <button
                                onClick={() => handleAnswer(false)}
                                className="bg-neutral-700 text-white px-6 py-3 rounded-xl hover:bg-neutral-600 transition"
                            >
                                Not AI
                            </button>
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {selected !== null && (
                    <div className="mt-6 text-center text-xl font-bold">
                        {isCorrect ? (
                            <span className="text-green-600">Correct ✓</span>
                        ) : (
                            <span className="text-red-600">Wrong ✗</span>
                        )}
                    </div>
                )}

                {/* Next Button */}
                {selected !== null && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={handleNext}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition"
                        >
                            {round === 1 &&
                                currentIndex === totalQuestions - 1
                                ? "Finish Round 1"
                                : round === 2 &&
                                    currentIndex === totalQuestions - 1
                                    ? "Finish Game"
                                    : "Next Question"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

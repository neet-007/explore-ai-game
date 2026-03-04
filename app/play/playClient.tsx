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
    type: string;
};

const ROUND_1_TIME = Number(process.env.NEXT_PUBLIC_ROUND_1_TIME) || 40;
const ROUND_2_TIME = Number(process.env.NEXT_PUBLIC_ROUND_2_TIME) || 60;

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
    const [isVerifying, setIsVerifying] = useState(false);

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

    // Timer
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
        if (selected !== null || isVerifying) return;

        setSelected(choice);
        setIsVerifying(true);

        const question =
            round === 1
                ? roundOneQuestions[currentIndex]
                : roundTwoQuestions[currentIndex];

        const correct = await verifyAnswer(round, question.id, choice);

        setIsCorrect(!!correct);
        setIsVerifying(false);

        if (correct) setLocalScore((s) => s + 1);

        if (round === 1) {
            setAnswersRoundOne((prev) => [
                ...prev,
                { id: question.id, choice: choice as number },
            ]);
        } else {
            setAnswersRoundTwo((prev) => [
                ...prev,
                { id: question.id, isAi: choice as boolean },
            ]);
        }
    }

    function handleNext() {
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

    // Username Screen
    if (!started) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-96 p-8 rounded-2xl shadow-2xl border border-slate-800 bg-neutral-950">
                    <h1 className="text-2xl font-bold mb-6 text-white tracking-tight">
                        Enter Username
                    </h1>

                    <input
                        placeholder="Player One"
                        className="w-full p-3 rounded-lg mb-6 bg-black border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                    />

                    <button
                        disabled={!username.trim()}
                        onClick={() => setStarted(true)}
                        className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-500 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        );
    }

    // Round 1 End
    if (roundEnded && round === 1) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <h1 className="text-3xl font-bold">
                    Round 1 Complete
                </h1>
                <div className="text-lg">
                    Current Score:{" "}
                    <span className="font-bold text-blue-600">
                        {localScore}
                    </span>
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

    // Final Screen
    if (finalScore !== null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <h1 className="text-3xl font-bold">
                    Final Score
                </h1>
                <div className="text-5xl font-extrabold text-blue-600">
                    {finalScore}
                </div>

                <div className="flex gap-4">
                    <Link
                        href="/leaderboard"
                        className="px-8 py-4 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition"
                    >
                        Leaderboard
                    </Link>
                    <Link
                        href="/play"
                        className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-green-500 hover:text-white transition shadow-lg"
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
            : ((currentIndex + 1) / totalQuestions) * 100;

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    const isVideo =
        round === 2 &&
        (currentQuestion as RoundTwoQuestion).type === "video";

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between mb-6 text-lg font-semibold">
                    <div>Round {round}</div>
                    <div className="text-blue-600">
                        Score: {localScore}
                    </div>
                    <div className={timer <= 10 ? "text-red-600" : ""}>
                        Time: {timer}s
                    </div>
                </div>

                <div className="w-full mb-6">
                    <div className="flex justify-between text-sm mb-1">
                        <span>
                            Question {currentIndex + 1} / {totalQuestions}
                        </span>
                        <span>{Math.round(progress)}%</span>
                    </div>

                    <div className="w-full h-3 bg-neutral-300 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="text-center mb-6">
                    {round === 1 && (
                        <h2 className="text-2xl font-bold">
                            Which image is Real?
                        </h2>
                    )}
                    {round === 2 && (
                        <h2 className="text-2xl font-bold">
                            Is this content AI generated?
                        </h2>
                    )}
                </div>

                {round === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                        {[1, 2].map((opt) => {
                            const url =
                                opt === 1
                                    ? (currentQuestion as RoundOneQuestion).option_a
                                    : (currentQuestion as RoundOneQuestion).option_b;

                            const ring =
                                selected === opt
                                    ? isCorrect
                                        ? "ring-4 ring-green-500"
                                        : "ring-4 ring-red-500"
                                    : "hover:ring-2 hover:ring-indigo-400";

                            return (
                                <div
                                    key={opt}
                                    className={`w-full max-w-md cursor-pointer transition ${ring} ${isVerifying
                                        ? "opacity-50 pointer-events-none"
                                        : ""
                                        }`}
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

                {round === 2 && (
                    <div className="flex flex-col items-center gap-6">
                        {isVideo ? (
                            <video
                                src={(currentQuestion as RoundTwoQuestion).url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="rounded-xl w-full max-w-3xl max-h-[70vh] object-contain"
                            />
                        ) : (
                            <img
                                src={(currentQuestion as RoundTwoQuestion).url}
                                className="rounded-xl w-full max-w-3xl max-h-[70vh] object-contain"
                            />
                        )}

                        <div className="flex gap-6 flex-wrap justify-center">
                            <button
                                disabled={isVerifying}
                                onClick={() => handleAnswer(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                AI Generated
                            </button>

                            <button
                                disabled={isVerifying}
                                onClick={() => handleAnswer(false)}
                                className="bg-neutral-700 text-white px-6 py-3 rounded-xl hover:bg-neutral-600 transition disabled:opacity-50"
                            >
                                Not AI
                            </button>
                        </div>
                    </div>
                )}

                {selected !== null && (
                    <div className="mt-6 text-center text-xl font-bold">
                        {isVerifying ? (
                            <span className="text-yellow-600 animate-pulse">
                                Verifying...
                            </span>
                        ) : isCorrect ? (
                            <span className="text-green-600">
                                Correct ✓
                            </span>
                        ) : (
                            <span className="text-red-600">
                                Wrong ✗
                            </span>
                        )}
                    </div>
                )}

                {selected !== null && !isVerifying && (
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

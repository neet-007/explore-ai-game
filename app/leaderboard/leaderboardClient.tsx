"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/app/actions";
import Link from "next/link";

export default function LeaderboardClient() {
    const [players, setPlayers] = useState<{ name: string; score: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeaderboard().then((data) => {
            setPlayers(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-4 font-sans">
            <div className="max-w-4xl mx-auto py-10">

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Leaderboard</h1>
                    </div>
                    <Link href="/play" className="bg-zinc-100 text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-300 transition-colors">
                        Play Again
                    </Link>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-800/30">
                                <th className="px-6 py-4 font-bold uppercase text-xs text-zinc-500 w-20">Rank</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs text-zinc-500">Player</th>
                                <th className="px-6 py-4 font-bold uppercase text-xs text-zinc-500 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-zinc-500 animate-pulse">Loading rankings...</td>
                                </tr>
                            ) : players.map((player, index) => (
                                <tr key={index} className="group hover:bg-zinc-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <RankBadge rank={index + 1} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                            {player.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono font-bold text-emerald-400">
                                            {player.score.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && players.length === 0 && (
                        <div className="py-20 text-center text-zinc-600">No data available yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    const isTopThree = rank <= 3;
    const colors = [
        "bg-yellow-500/20 text-yellow-500 border-yellow-500/50", // Gold
        "bg-zinc-400/20 text-zinc-400 border-zinc-400/50",     // Silver
        "bg-orange-700/20 text-orange-600 border-orange-700/50" // Bronze
    ];

    return (
        <div className={`
      inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-bold
      ${isTopThree ? colors[rank - 1] : "bg-transparent text-zinc-600 border-transparent"}
    `}>
            {rank}
        </div>
    );
}

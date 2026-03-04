"use client";

import { useState, useEffect } from "react";
import { loginAdmin, logoutAdmin, addQuestions, checkAdminSession } from "@/app/adminActions";

export default function AdminClient() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    const [round, setRound] = useState<1 | 2>(1);

    useEffect(() => {
        checkAdminSession().then(setIsLoggedIn);
    }, []);

    if (!isLoggedIn) {
        return (
            <form action={async (fd) => {
                const res = await loginAdmin(fd);
                if (res.success) setIsLoggedIn(true);
                else alert(res.error);
            }} className="flex flex-col gap-4 max-w-xs mx-auto mt-20 p-8 border border-zinc-800 rounded">
                <h1 className="text-xl font-bold">Admin Login</h1>
                <input name="username" placeholder="Username" className="bg-zinc-900 p-2 border border-zinc-700" />
                <input name="password" type="password" placeholder="Password" className="bg-zinc-900 p-2 border border-zinc-700" />
                <button className="bg-white text-black font-bold py-2">Login</button>
            </form>
        );
    }

    const handleBulkInsert = async () => {
        try {
            console.log(jsonInput);
            const data = JSON.parse(jsonInput);
            const items = Array.isArray(data) ? data : [data];
            const res = await addQuestions(round, items);
            console.log(res);
            if (res.success) {
                alert(`Successfully added ${res.count} items!`);
                setJsonInput("");
            }
        } catch (e) {
            alert("Invalid JSON format");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black italic uppercase">Admin Panel</h1>
                <button onClick={async () => { await logoutAdmin(); setIsLoggedIn(false); }} className="text-zinc-500 hover:text-white">Logout</button>
            </div>

            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setRound(1)} className={`px-4 py-2 rounded ${round === 1 ? 'bg-emerald-500 text-black' : 'bg-zinc-800'}`}>Round 1</button>
                    <button onClick={() => setRound(2)} className={`px-4 py-2 rounded ${round === 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-800'}`}>Round 2</button>
                </div>

                <h3 className="mb-2 text-sm font-bold text-zinc-400">BULK JSON INSERT (Array of objects)</h3>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={round === 1
                        ? '[{ "option_a_url": "...", "option_b_url": "...", "correct_choice": 1 }]'
                        : '[{ "url": "...", "type": "video", "is_ai_generated": true }]'}
                    className="w-full h-64 bg-black p-4 font-mono text-sm border border-zinc-700 rounded mb-4"
                />
                <button
                    onClick={handleBulkInsert}
                    className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition"
                >
                    Push to Database
                </button>
            </div>
        </div>
    );
}

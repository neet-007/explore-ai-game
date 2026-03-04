import ComparisonComponent from "@/components/animation";
import Link from "next/link";

export default function GameDescription() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen w-full bg-slate-900">

            <div className="lg:col-span-1 flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-slate-800">
                <div className="max-w-2xl">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                        REAL OR <span className="text-red-500">AI?</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
                        Spot the differences between AI and real images.
                        in the first round there will be 2 images and you have to choose the real one,
                        in the second round there will be a single image or video and you have to choose if it is AI generated or not.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/play"
                            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 text-center shadow-lg hover:shadow-green-500/20"
                        >
                            Start Playing
                        </Link>

                        <Link
                            href="/leaderboard"
                            className="px-8 py-4 bg-slate-800 text-white font-bold rounded-full border border-slate-700 hover:bg-slate-700 transition-all duration-300 text-center"
                        >
                            Leaderboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 flex items-center justify-center bg-slate-950/50">
                <ComparisonComponent />
            </div>

        </div>
    );
}

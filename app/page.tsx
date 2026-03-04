import EEExplore from "@/components/explore";
import GameDescription from "@/components/gameDescreption";

export default function Home() {
    return (
        <div className="flex flex-col p-4">
            <EEExplore />
            <GameDescription />
        </div>
    );
}

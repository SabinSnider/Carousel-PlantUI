import Image from "next/image";
import EmblaCarousel from "./components/EmblaCrousel";
import { EmblaOptionsType } from "embla-carousel";
import './css/embla.css';

const OPTIONS: EmblaOptionsType = { loop: true ,}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
       <EmblaCarousel options={OPTIONS} />

    </main>
  );
}

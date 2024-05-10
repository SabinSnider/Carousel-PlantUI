"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

import { useCallback, useEffect, useRef } from "react";
import sliderData from "./sliderData";

type PropType = {
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { options } = props;
  // emblaRef will be a reference to the carousel viewport
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]); // to autoplay slider
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla__slide__number") as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }
          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode.style.transform = `scale(${scale})`;
        });
      });
    },
    []
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale);
  }, [emblaApi, tweenScale]);

  return (
    <div className="embla">
      {/* Carousel viewport */}
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {/* Carousel slide's */}
          {sliderData.map((item, index) => {
            // console.log(item, "....");
            return (
              <div className="embla__slide" key={index}>
                <div className="embla__slide__number">
                  {/* the image */}
                  <img
                    className="embla__slide__img"
                    src={item.url}
                    alt="Plant picture"
                  />
                  <div className="absolute top-1/2 left-1/3 ml-7 md:w-auto transform -translate-x-1/2 translate-y-[3rem] md:translate-y-[9rem]  lg:translate-y-48  py-2 lg:py-4 px-2 lg:px-8 ">
                    <div className="flex flex-row-reverse">
                      <div>
                        {/* title */}
                        <h1 className=" w-full  rounded-full text-xl lg:text-2xl text-white font-extrabold">
                          {item.title}
                        </h1>

                        <h2 className=" w-full  rounded-full text-xl lg:text-2xl text-white font-extrabold">
                          {item.subtitle}
                        </h2>
                      </div>
                      <div>
                        <a
                          role="button"
                          className="absolute top-1/2 left-1/3  ml-7  text-white text-sm px-4 py-2  border rounded-full"
                        >
                          + Add to Cart
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
     
    </div>
  );
};
export default EmblaCarousel;

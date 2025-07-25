import type { SlideData } from "./types"; // Solo si lo tenés separado

export const videoSlide: SlideData = {
  id: 1,
  type: "video",
  videoPath: "/assets/Video_slider.mp4",
};

export const imageSlides: SlideData[] = [
  {
    id: 3,
    type: "image",
    imagePath: "/assets/slider_fotovoltaico.jpg",
  },
  {
    id: 4,
    type: "image",
    imagePath: "/assets/slider_laboratorio.jpg",
  },
];
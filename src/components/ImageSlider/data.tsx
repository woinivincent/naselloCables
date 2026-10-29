import type { SlideData } from "./types"; // Solo si lo tenés separado

export const videoSlide: SlideData = {
  id: 1,
  type: "video",
  videoPath: "/assets/Video_slider.mp4",
  posterPath: "/assets/Video_slider-poster.webp",
};

export const imageSlides: SlideData[] = [
  {
    id: 3,
    type: "image",
    imagePath: "/assets/slider_fotovoltaico.jpg",
    webpPath: "/assets/slider_fotovoltaico.webp",
  },
  {
    id: 4,
    type: "image",
    imagePath: "/assets/slider_laboratorio.jpg",
    webpPath: "/assets/slider_laboratorio.webp",
  },
   {
    id: 5,
    type: "image",
    imagePath: "/assets/slider_acometida.jpg",
    webpPath: "/assets/slider_acometida.webp",
  },
];
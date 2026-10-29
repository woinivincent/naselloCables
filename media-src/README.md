# media-src

Originales de medios que **no** se publican (quedan fuera de `public/` y del build).

- `Video_slider.original.mp4` — original 1920×1080, 31 s, 13,6 Mbps (52,7 MB).
  La versión publicada `public/assets/Video_slider.mp4` se generó con:

  ```bash
  ffmpeg -i media-src/Video_slider.original.mp4 -vf "scale=-2:720:flags=lanczos,fps=30" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 1150k -maxrate 1600k -bufsize 3000k -pass 1 -an -f mp4 /dev/null
  ffmpeg -i media-src/Video_slider.original.mp4 -vf "scale=-2:720:flags=lanczos,fps=30" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 1150k -maxrate 1600k -bufsize 3000k -pass 2 -an -movflags +faststart public/assets/Video_slider.mp4
  ffmpeg -ss 0 -i media-src/Video_slider.original.mp4 -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 72 public/assets/Video_slider-poster.webp
  ```

Las imágenes JPG originales (antes de la recompresión) siguen disponibles en el historial de git,
por ejemplo: `git show e12afcf:public/assets/foto_derecha-calidad.jpg > original.jpg`.

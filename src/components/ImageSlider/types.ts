export interface SlideData {
  id: number;
  type: 'image' | 'video';
  imagePath?: string;
  videoPath?: string;
  posterPath?: string;
  /** WebP version of imagePath; the JPG stays as fallback */
  webpPath?: string;
  title?: string;
  description?: string;
  textPosition?: 'center' | 'left' | 'right';
}
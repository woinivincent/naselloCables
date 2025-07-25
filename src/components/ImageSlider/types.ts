export interface SlideData {
  id: number;
  type: 'image' | 'video';
  imagePath?: string;
  videoPath?: string;
  title?: string;
  description?: string;
  textPosition?: 'center' | 'left' | 'right';
}
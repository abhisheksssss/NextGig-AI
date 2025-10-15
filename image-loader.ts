export default function cloudinaryLoader({ src}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Return Cloudinary URL with transformations
  return src;
}

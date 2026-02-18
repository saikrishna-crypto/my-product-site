'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('photoshoot');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const imgRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://asia-south1.workflow.boltic.app/fac24588-b8d4-4b36-aec8-4700d8dca3e0');
      const data = await response.json();
      const productsData = data.result?.data || data.data || data;
      setProducts(Array.isArray(productsData) ? productsData : [productsData]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const getImagesForCategory = (product: any, category: string) => {
    const keys = {
      photoshoot: ['photoshoot_1', 'photoshoot_2', 'photoshoot_3', 'photoshoot_4', 'photoshoot_5'],
      lifestyle: ['lifestyle_1', 'lifestyle_2', 'lifestyle_3', 'lifestyle_4', 'lifestyle_5'],
      marketing: ['marketing_1', 'marketing_2', 'marketing_3', 'marketing_4', 'marketing_5'],
    };
    return keys[category as keyof typeof keys].map((key) => product[key]).filter(Boolean);
  };

  const openProduct = (product: any) => {
    setSelectedProduct(product);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    window.scrollTo(0, 0);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxImage(images[index]);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxImages([]);
    setLightboxIndex(0);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const goNext = useCallback(() => {
    if (lightboxImages.length === 0) return;
    const nextIndex = (lightboxIndex + 1) % lightboxImages.length;
    setLightboxIndex(nextIndex);
    setLightboxImage(lightboxImages[nextIndex]);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [lightboxIndex, lightboxImages]);

  const goPrev = useCallback(() => {
    if (lightboxImages.length === 0) return;
    const prevIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    setLightboxIndex(prevIndex);
    setLightboxImage(lightboxImages[prevIndex]);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [lightboxIndex, lightboxImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, goNext, goPrev]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleDoubleClick = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientX - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    photoshoot: 'Photoshoot',
    lifestyle: 'Lifestyle Photoshoot',
    marketing: 'Marketing Creative',
  };

  const Banner = () => (
    <div className="w-full mb-10" style={{ backgroundColor: '#58595b' }}>
      <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-center">
        <img
          src="https://cdn.prod.website-files.com/670cac49528bf16270018416/670cac49528bf162700185f8_HhuJ7pGNhgP9jli6VC-uY-transformed-p-500.png"
          alt="Trends Footwear"
          className="h-14 object-contain brightness-0 invert"
        />
      </div>
    </div>
  );

  const Lightbox = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', cursor: 'pointer' }}
      onClick={closeLightbox}
    >
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setZoom(prev => Math.min(prev + 0.3, 5))} className="bg-white text-gray-800 w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center hover:bg-gray-200">+</button>
        <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.5))} className="bg-white text-gray-800 w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center hover:bg-gray-200">−</button>
        <button onClick={handleDoubleClick} className="bg-white text-gray-800 px-3 h-10 rounded-full text-sm font-semibold flex items-center justify-center hover:bg-gray-200">Reset</button>
        <button onClick={closeLightbox} className="bg-white text-gray-800 w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center hover:bg-gray-200">✕</button>
      </div>

      {lightboxImages.length > 1 && (
        <>
          <butt

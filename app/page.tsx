'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('photoshoot');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
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
return keys[category as keyof typeof keys].map((key) => product[key]).filter(Boolean);  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    window.scrollTo(0, 0);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
  };

  const openLightbox = (images, index) => {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxImage) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, goNext, goPrev]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleDoubleClick = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
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

  // ─── LIGHTBOX ──────────────────────────────────────────────────────
  const Lightbox = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', cursor: 'pointer' }}
      onClick={closeLightbox}
    >
      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setZoom(prev => Math.min(prev + 0.3, 5))} className="bg-white text-gray-800 w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center hover:bg-gray-200">+</button>
        <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.5))} className="bg-white text-gray-800 w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center hover:bg-gray-200">−</button>
        <button onClick={handleDoubleClick} className="bg-white text-gray-800 px-3 h-10 rounded-full text-sm font-semibold flex items-center justify-center hover:bg-gray-200">Reset</button>
        <button onClick={closeLightbox} className="bg-white text-gray-800 w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center hover:bg-gray-200">✕</button>
      </div>

      {/* Left Arrow */}
      {lightboxImages.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 w-12 h-12 rounded-full font-bold text-2xl flex items-center justify-center hover:bg-gray-200 z-10 shadow-lg"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
        >
          ‹
        </button>
      )}

      {/* Right Arrow */}
      {lightboxImages.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 w-12 h-12 rounded-full font-bold text-2xl flex items-center justify-center hover:bg-gray-200 z-10 shadow-lg"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
        >
          ›
        </button>
      )}

      {/* Image counter */}
      {lightboxImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full" onClick={(e) => e.stopPropagation()}>
          {lightboxIndex + 1} / {lightboxImages.length} &nbsp;•&nbsp; ← → keys to navigate &nbsp;•&nbsp; Click outside to close
        </div>
      )}

      {/* Image */}
      <div
        className="flex items-center justify-center"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          ref={imgRef}
          src={lightboxImage}
          alt="Full size"
          className="max-w-3xl max-h-screen object-contain rounded-xl select-none"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
          draggable={false}
        />
      </div>
    </div>
  );

  // ─── PRODUCT DETAIL PAGE ───────────────────────────────────────────
  if (selectedProduct) {
    const categoryImages = getImagesForCategory(selectedProduct, selectedCategory);

    return (
      <div className="min-h-screen bg-gray-50">
        <Banner />

        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-10">
            <button onClick={closeProduct} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-lg transition-colors">
              ← Back to Products
            </button>
            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-semibold text-lg">View as:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border-2 border-gray-300 rounded-xl px-5 py-2.5 text-gray-700 font-medium text-lg bg-white shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="photoshoot">Photoshoot</option>
                <option value="lifestyle">Lifestyle Photoshoot</option>
                <option value="marketing">Marketing Creative</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            {/* LEFT */}
            <div>
              {/* Main Image - always original */}
              <div
                className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5 cursor-zoom-in"
                onClick={() => openLightbox([selectedProduct.original_image_url], 0)}
              >
                <img
                  src={selectedProduct.original_image_url}
                  alt={selectedProduct.product_name}
                  className="w-full h-[480px] object-contain p-8"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x400/EEEEEE/999999?text=Image+Not+Found'; }}
                />
              </div>

              {/* Thumbnails */}
              {categoryImages.length > 0 ? (
                <>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                    {categoryLabels[selectedCategory]} — Pixelbin Generated
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {categoryImages.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-gray-800 cursor-pointer transition-all hover:shadow-md"
                        onClick={() => openLightbox(categoryImages, i)}
                      >
                        <img
                          src={imgUrl}
                          alt={`Generated ${i + 1}`}
                          className="w-full h-full object-contain p-1"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100x100/EEEEEE/999999?text=?'; }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Click image to zoom • Use ← → keys or buttons to navigate</p>
                </>
              ) : (
                <div className="flex items-center justify-center h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">No {categoryLabels[selectedCategory]} images yet</p>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex flex-col justify-center">
              <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 w-fit">
                Pixelbin Generated
              </div>
              {selectedProduct.brand_name && (
                <p className="text-gray-500 text-base font-semibold uppercase tracking-widest mb-2">{selectedProduct.brand_name}</p>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedProduct.product_name}</h1>
              {selectedProduct.description && (
                <p className="text-gray-500 text-xl mb-8">{selectedProduct.description}</p>
              )}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <p className="text-base text-gray-500 mb-1">Currently viewing</p>
                <p className="font-bold text-gray-800 text-xl">{categoryLabels[selectedCategory]}</p>
                <p className="text-base text-gray-400 mt-1">{categoryImages.length} generated images available</p>
              </div>
            </div>
          </div>
        </div>

        {lightboxImage && <Lightbox />}
      </div>
    );
  }

  // ─── PRODUCT GRID PAGE ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-end mb-10 gap-3">
          <label className="text-gray-700 font-semibold text-xl">View as:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-2 border-gray-300 rounded-xl px-5 py-3 text-gray-700 font-medium text-lg bg-white shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="photoshoot">Photoshoot</option>
            <option value="lifestyle">Lifestyle Photoshoot</option>
            <option value="marketing">Marketing Creative</option>
          </select>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-gray-500 text-xl">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div
                key={product.id || index}
                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
                onClick={() => openProduct(product)}
              >
                <div className="p-6 pb-2">
                  <img
                    src={product.original_image_url}
                    alt={product.product_name}
                    className="w-full h-72 object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x300/EEEEEE/999999?text=No+Image'; }}
                  />
                </div>
                <div className="px-6 pb-6 pt-2">
                  {product.brand_name && (
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-1">{product.brand_name}</p>
                  )}
                  <h3 className="font-bold text-gray-900 text-xl mb-4">{product.product_name}</h3>
                  <button className="w-full bg-gray-900 text-white text-base font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors">
                    View Generated Images
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

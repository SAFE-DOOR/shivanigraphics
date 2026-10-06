import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Clock, 
  MessageCircle, 
  Check, 
  ShieldCheck, 
  FileCheck, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShoppingBag, 
  Mail, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProductItem, CartItem } from '../types';
import { generateWhatsAppOrderUrl, generateEmailOrderUrl, WHATSAPP_PRIMARY } from '../utils/whatsapp';
import { StickyWhatsAppButton } from './StickyWhatsAppButton';

interface ProductConfiguratorProps {
  product: ProductItem;
  onAddToCart: (item: CartItem) => void;
  onOpenArtworkGuide: () => void;
}

export const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({
  product,
  onAddToCart,
  onOpenArtworkGuide
}) => {
  // Initialize state with default values from product config
  const [selectedSizeId, setSelectedSizeId] = useState(product.config.sizes[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState(product.config.materials[0]?.id || '');
  const [selectedFinishId, setSelectedFinishId] = useState(product.config.finishes[0]?.id || '');
  const [selectedSideId, setSelectedSideId] = useState(product.config.sides[0]?.id || '');
  const [selectedQty, setSelectedQty] = useState(
    product.config.quantities.find(q => q.popular)?.qty || product.config.quantities[0]?.qty || 100
  );
  const [customQtyInput, setCustomQtyInput] = useState('');
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [hasArtwork, setHasArtwork] = useState(true);
  const [customNotes, setCustomNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [designLink, setDesignLink] = useState('');
  const [showAddedNotice, setShowAddedNotice] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImageName(file.name);
      
      // Generate clean public-facing cloud storage URL
      const uniqueCode = Math.random().toString(36).substring(2, 9);
      const cleanCloudUrl = `https://shivanigraphics.print/uploads/${uniqueCode}-${file.name.replace(/\s+/g, '_')}`;
      setDesignLink(cleanCloudUrl);

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setUploadedImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync state if product changes
  React.useEffect(() => {
    setSelectedSizeId(product.config.sizes[0]?.id || '');
    setSelectedMaterialId(product.config.materials[0]?.id || '');
    setSelectedFinishId(product.config.finishes[0]?.id || '');
    setSelectedSideId(product.config.sides[0]?.id || '');
    setSelectedQty(
      product.config.quantities.find(q => q.popular)?.qty || product.config.quantities[0]?.qty || 100
    );
    setCustomNotes('');
    setDesignLink('');
  }, [product.id]);

  // Find active option objects
  const activeSize = useMemo(() => 
    product.config.sizes.find(s => s.id === selectedSizeId) || product.config.sizes[0],
    [product, selectedSizeId]
  );

  const activeMaterial = useMemo(() => 
    product.config.materials.find(m => m.id === selectedMaterialId) || product.config.materials[0],
    [product, selectedMaterialId]
  );

  const activeFinish = useMemo(() => 
    product.config.finishes.find(f => f.id === selectedFinishId) || product.config.finishes[0],
    [product, selectedFinishId]
  );

  const activeSide = useMemo(() => 
    product.config.sides.find(s => s.id === selectedSideId) || product.config.sides[0],
    [product, selectedSideId]
  );

  // Handle direct WhatsApp quote dispatch
  const handleDirectWhatsAppOrder = () => {
    const url = generateWhatsAppOrderUrl({
      productTitle: product.title,
      size: activeSize?.name || '',
      material: activeMaterial?.name || '',
      finish: activeFinish?.name || '',
      sides: activeSide?.name || '',
      quantity: selectedQty,
      hasArtwork,
      notes: customNotes,
      customerName,
      customerCity,
      uploadedImageName: uploadedImageName || undefined,
      designLink: designLink || undefined
    });
    window.open(url, '_blank');
  };

  // Handle direct Email quote dispatch
  const handleDirectEmailOrder = () => {
    const url = generateEmailOrderUrl({
      productTitle: product.title,
      size: activeSize?.name || '',
      material: activeMaterial?.name || '',
      finish: activeFinish?.name || '',
      sides: activeSide?.name || '',
      quantity: selectedQty,
      hasArtwork,
      notes: customNotes,
      customerName,
      customerCity,
      uploadedImageName: uploadedImageName || undefined
    });
    window.location.href = url;
  };

  // Add to Multi-Item Inquiry Bag
  const handleAddToInquiryBag = () => {
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      config: {
        sizeId: selectedSizeId,
        materialId: selectedMaterialId,
        finishId: selectedFinishId,
        sideId: selectedSideId,
        quantity: selectedQty,
        customNotes,
        hasArtwork
      },
      sizeLabel: activeSize?.name || '',
      materialLabel: activeMaterial?.name || '',
      finishLabel: activeFinish?.name || '',
      sideLabel: activeSide?.name || '',
      imageUrl: product.images[0]?.url || ''
    };

    onAddToCart(cartItem);
    setShowAddedNotice(true);
    setTimeout(() => setShowAddedNotice(false), 3000);
  };

  return (
    <div id="product-configurator-section" className="space-y-6 sm:space-y-8 max-w-full overflow-hidden">
      
      {/* Product Title & Brand Badge Header */}
      <div className="space-y-2 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {product.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
              {product.badge}
            </span>
          )}
          {product.featureBadge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-2xs">
              ⚡ {product.featureBadge}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#50007c]">
            {product.categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>{product.dispatchTag}</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight break-words">
          {product.title}
        </h1>

        {product.subtitle && (
          <p className="text-sm sm:text-base font-bold text-[#50007c] bg-purple-50/80 px-3 py-1.5 rounded-xl border border-purple-200/80 inline-block">
            ⚡ {product.subtitle}
          </p>
        )}

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {product.shortDescription}
        </p>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold mt-2">
          <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Paper quality, custom sizes, and exact specifications are discussed and finalized directly on WhatsApp.</span>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="font-bold text-slate-800">{product.rating}</span>
          <span>·</span>
          <span className="text-slate-500">({product.reviewCount} customer reviews)</span>
        </div>
      </div>

      {/* Specification Selection Controls: Clean WhatsApp Discussion Banner */}
      <div className="space-y-5">
        
        {/* Modern WhatsApp Size & Paper Quality Consultation Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-purple-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Direct WhatsApp Consultation</span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Discuss Size, Paper Quality & Custom Specs
              </h3>
              <p className="text-xs text-purple-200 max-w-md leading-relaxed">
                Connect instantly with our master printers on WhatsApp to finalize precise dimensions, paper stocks, special lamination, and digital proofs.
              </p>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(`Hello Shivani Graphics! I want to discuss size, paper quality, and requirements for: ${product.title}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer ring-2 ring-emerald-400/40 w-full sm:w-auto justify-center"
            >
              <MessageCircle className="w-4.5 h-4.5 fill-white shrink-0" />
              <span>Discuss on WhatsApp 💬</span>
            </a>
          </div>
        </div>

        {/* 1. Size / Dimensions Radio-Group */}
        {product.config.sizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-purple-100 text-[#50007c] flex items-center justify-center font-black text-xs">1</span>
                <span>Select Size / Format</span>
              </span>
              <span className="text-purple-900 font-bold text-[11px] bg-purple-50 px-2 py-0.5 rounded-md">
                {activeSize?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.config.sizes.map((size) => {
                const isSelected = size.id === selectedSizeId;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer min-w-0 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50/90 border-[#50007c] ring-2 ring-[#50007c]/25 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs sm:text-sm font-black ${isSelected ? 'text-[#50007c]' : 'text-slate-900'}`}>
                        {size.name}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-[#50007c] border-[#50007c] text-white' : 'border-slate-300 bg-white text-transparent'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    {size.description && (
                      <p className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? 'text-purple-900/80 font-medium' : 'text-slate-500'}`}>
                        {size.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}



        {/* 5. Desired Quantity Tier Selection */}
        {product.config.quantities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                5. Desired Quantity
              </span>
              <span className="text-orange-600 font-bold text-[11px]">
                {selectedQty} units selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {product.config.quantities.map((q) => {
                const isSelected = q.qty === selectedQty;
                return (
                  <button
                    key={q.qty}
                    type="button"
                    onClick={() => { setSelectedQty(q.qty); setCustomQtyInput(''); }}
                    className={`p-2.5 rounded-xl text-center transition-all border cursor-pointer min-w-0 relative ${
                      isSelected
                        ? 'bg-[#50007c] text-white border-[#50007c] shadow-sm font-black'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 font-bold'
                    }`}
                  >
                    {q.popular && !isSelected && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                        Popular
                      </span>
                    )}
                    <span className="text-xs sm:text-sm block">{q.qty}</span>
                    <span className={`text-[10px] block font-normal ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                      units
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Quantity Input */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-xs text-slate-600 font-bold">Or enter custom quantity:</span>
              <input
                type="number"
                min="1"
                value={customQtyInput}
                onChange={(e) => {
                  setCustomQtyInput(e.target.value);
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setSelectedQty(val);
                  }
                }}
                placeholder="e.g. 75"
                className="w-32 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c] font-black text-slate-900 bg-white"
              />
              <span className="text-xs font-bold text-slate-500">units</span>
            </div>
          </div>
        )}

        {/* 6. Artwork Readiness & Image File Upload */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <span className="block font-bold text-slate-900 text-xs">
            Artwork & Prepress Status:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHasArtwork(true)}
              className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                hasArtwork
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>I have print-ready PDF / CDR file</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHasArtwork(false)}
              className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                !hasArtwork
                  ? 'bg-purple-50 border-[#50007c] text-purple-950 font-bold ring-2 ring-[#50007c]/20'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#50007c] shrink-0" />
                <span>I need Shivani Design Support</span>
              </div>
            </button>
          </div>

          {/* User Image Upload feature */}
          <div className="pt-2 border-t border-slate-200/80">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Upload Design / Photo Image (Optional):
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-purple-50 text-[#50007c] border border-purple-200 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-2xs transition-colors">
                <FileCheck className="w-4 h-4 text-[#50007c]" />
                <span>Choose Image File...</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>

              {uploadedImageName ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-full sm:w-auto">
                  <span>📎 {uploadedImageName}</span>
                  <button 
                    type="button" 
                    onClick={() => { setUploadedImageName(null); setUploadedImagePreview(null); }}
                    className="text-red-500 hover:text-red-700 ml-2 text-sm font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">PNG, JPG, WEBP or PDF up to 25MB</span>
              )}
            </div>

            {uploadedImagePreview && (
              <div className="mt-2.5 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs">
                <img src={uploadedImagePreview} alt="Uploaded Design" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Paste Design File Link (Google Drive, Dropbox, WeTransfer) */}
          <div className="pt-3 border-t border-slate-200/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Or Share Design File Link (Google Drive / Dropbox / WeTransfer):
            </label>
            <input
              type="url"
              value={designLink}
              onChange={(e) => setDesignLink(e.target.value)}
              placeholder="https://drive.google.com/... or https://wetransfer.com/..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c] bg-white font-medium"
            />
            <p className="text-[10px] text-slate-500">
              Paste your shareable cloud folder link so our pre-press team can instantly download your high-res CDR/PDF files.
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Free digital PDF proof shared on WhatsApp before printing.</span>
            <button
              type="button"
              onClick={onOpenArtworkGuide}
              className="text-[#50007c] font-bold hover:underline cursor-pointer"
            >
              View Artwork Guide →
            </button>
          </div>
        </div>

        {/* 7. Optional Customer & Delivery Destination */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
          <span className="block font-bold text-slate-800 text-xs">
            Optional Project Details (For Faster Quotation):
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your Name / Company (e.g. Rahul)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
            />
            <input
              type="text"
              value={customerCity}
              onChange={(e) => setCustomerCity(e.target.value)}
              placeholder="Delivery City / Area (e.g. Dwarka, Delhi)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c]"
            />
          </div>

          <textarea
            rows={2}
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Special instructions (e.g., need 4-hour express courier, gold foil logo, rounded corners)..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#50007c] resize-none"
          />
        </div>

      </div>

      {/* Summary Box & Primary Inquiry CTAs (QUOTE-FIRST / NO-PRICE MODEL) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#3b005c] text-white space-y-4 shadow-xl border border-slate-800">
        
        {/* Selected Config Summary */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Quotation Summary:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant Wholesale Rate on WhatsApp</span>
            </span>
          </div>

          <div className="text-xs text-purple-100 space-y-1">
            <p><strong className="text-white">Product:</strong> {product.title}</p>
            <p><strong className="text-white">Selected Size:</strong> {activeSize?.name}</p>
            <p><strong className="text-white">Quantity:</strong> {selectedQty} units · {hasArtwork ? 'Print-ready file' : 'Design Support Needed'}</p>
          </div>
        </div>

        {/* Notice if added to inquiry list */}
        {showAddedNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-600/90 text-white rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Added to Multi-Item Inquiry Bag! Click the bag icon in the top header to review all items.</span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDirectWhatsAppOrder}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-400/40"
          >
            <MessageCircle className="w-5 h-5 fill-white shrink-0" />
            <span>Query & Order on WhatsApp (+91-9266944315)</span>
          </motion.button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToInquiryBag}
              className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Add to Inquiry Bag</span>
            </button>

            <button
              type="button"
              onClick={handleDirectEmailOrder}
              className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Submit Inquiry via Email</span>
            </button>
          </div>
        </div>

        {/* Guarantees Strip */}
        <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>100% Free Reprint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>4-Hr Delhi NCR Delivery</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <FileCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Free Digital Proof</span>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar for Mobile Viewport */}
      <StickyWhatsAppButton
        product={product}
        sizeName={activeSize?.name || ''}
        materialName={activeMaterial?.name || ''}
        finishName={activeFinish?.name || ''}
        sidesName={activeSide?.name || ''}
        quantity={selectedQty}
        hasArtwork={hasArtwork}
        notes={customNotes}
        customerName={customerName}
        customerCity={customerCity}
      />

    </div>
  );
};

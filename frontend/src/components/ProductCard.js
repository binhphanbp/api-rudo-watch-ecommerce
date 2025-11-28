import { formatCurrency } from '../utils/format.js';

export function ProductCard(product) {
  // 1. LOGIC TÍNH GIÁ HIỂN THỊ (QUAN TRỌNG)
  let displayPrice = 0;
  let originalPrice = 0; // Nếu có giá cũ

  // Nếu API trả về mảng variants
  if (
    product.variants &&
    Array.isArray(product.variants) &&
    product.variants.length > 0
  ) {
    // Lấy tất cả giá ra một mảng
    const prices = product.variants.map((v) => Number(v.price));
    // Tìm giá nhỏ nhất để hiển thị "Từ..."
    displayPrice = Math.min(...prices);
  }
  // Fallback: Nếu API trả về giá trực tiếp ở root (trường hợp backend xử lý sẵn)
  else {
    displayPrice = Number(product.price || 0);
    originalPrice = Number(product.original_price || 0); // Giả sử tên trường giá gốc
  }

  // 2. TÍNH DISCOUNT (Chỉ hiển thị nếu có giá gốc > giá bán)
  let discountTag = '';
  if (originalPrice > displayPrice) {
    const percent = Math.round(
      ((originalPrice - displayPrice) / originalPrice) * 100
    );
    discountTag = `
        <span class="bg-[#EAD8B1] text-[#5A4010] text-xs font-bold px-2 py-1 rounded">
            -${percent}%
        </span>`;
  }

  // 3. RENDER MÀU SẮC (Nếu có)
  const colorDots = product.colors
    ? product.colors
        .map(
          (color) => `
        <span class="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform" 
              style="background-color: ${color};" title="Màu sắc"></span>
      `
        )
        .join('')
    : '';

  return `
    <div class="group relative bg-white dark:bg-slate-800 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-white/5 flex flex-col h-full">
        
        <div class="absolute top-4 left-4 z-10">
            ${discountTag}
        </div>
        
        <button class="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
        </button>

        <div class="relative w-full aspect-square mb-4 overflow-hidden rounded-xl bg-gray-50 dark:bg-slate-700/50">
            <a href="/product-detail.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" 
                  class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform hover:scale-110 transition-transform duration-500 ease-in-out">
            </a>
        </div>

        <div class="flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-1">
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    ${product.brand_name || 'RUDO'}
                </span>
                <div class="flex gap-1">
                    ${colorDots}
                </div>
            </div>

            <a href="/product-detail.html?id=${
              product.id
            }" class="text-lg font-bold text-slate-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                ${product.name}
            </a>

            <div class="mt-auto flex items-end justify-between gap-2 mb-4">
                ${
                  originalPrice > 0
                    ? `
                    <span class="text-sm text-gray-400 line-through decoration-gray-400">
                        ${formatCurrency(originalPrice)}
                    </span>
                `
                    : ''
                }
                <span class="text-lg font-bold text-[#0A2A45] dark:text-blue-300">
                    ${
                      displayPrice > 0
                        ? formatCurrency(displayPrice)
                        : 'Liên hệ'
                    }
                </span>
            </div>
            
            <a href="/product-detail.html?id=${
              product.id
            }" class="w-full bg-[#0A2A45] hover:bg-[#153e60] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95">
                Xem chi tiết
            </a>
        </div>
    </div>
    `;
}

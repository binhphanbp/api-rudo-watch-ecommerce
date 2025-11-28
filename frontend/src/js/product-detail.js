import api, { getImageUrl } from '../services/api.js';
import CartService from '../services/cart.js';
import { formatCurrency } from '../utils/format.js';
import Swal from '../utils/swal.js'; // Dùng toast cho đẹp
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// Biến toàn cục lưu trạng thái sản phẩm đang xem
let state = {
  product: null, // Thông tin chung
  variants: [], // Mảng các biến thể (size, price, qty)
  selectedVariant: null, // Biến thể đang được chọn (để thêm vào giỏ)
};

const initDetail = async () => {
  if (!id) {
    window.location.href = '/products.html';
    return;
  }

  try {
    const res = await api.get(`/products/${id}`);
    const data = res.data.data || res.data;

    // 1. Lưu dữ liệu vào state
    state.product = {
      id: data.id,
      name: data.name,
      brand: data.brand_name || 'Thương hiệu',
      image: getImageUrl(data.image),
      description: data.description || 'Đang cập nhật...',
    };

    // Nếu API trả về variants, lưu vào. Nếu không có, tạo dummy variant
    state.variants = data.variants || [];

    // Mặc định chọn variant đầu tiên
    if (state.variants.length > 0) {
      state.selectedVariant = state.variants[0];
    }

    // 2. Render Giao diện
    renderInfo();
    renderGallery(data); // Nếu có nhiều ảnh
    renderVariants(); // Render nút chọn Size
  } catch (error) {
    console.error('Detail Error:', error);
  }
};

// --- HÀM RENDER ---

const renderInfo = () => {
  document.getElementById('product-name').textContent = state.product.name;
  document.getElementById('breadcrumb-name').textContent = state.product.name;
  document.getElementById('product-brand').textContent = state.product.brand;
  document.getElementById('main-image').src = state.product.image;

  // Render giá của variant đang chọn
  updatePriceDisplay();

  // Render mô tả (nếu có thẻ div chứa description)
  const descEl = document.getElementById('tab-desc');
  if (descEl) descEl.innerHTML = state.product.description;
};

const updatePriceDisplay = () => {
  const priceEl = document.getElementById('product-price');
  if (state.selectedVariant) {
    priceEl.textContent = formatCurrency(state.selectedVariant.price);
  } else {
    // Trường hợp sản phẩm không có biến thể (giá chung)
    priceEl.textContent = formatCurrency(state.product.price || 0);
  }
};

const renderVariants = () => {
  // Tìm vị trí để chèn nút chọn Size (Bạn cần thêm div này vào HTML product-detail.html)
  // Ví dụ thêm: <div id="variant-options" class="mb-6"></div> vào HTML
  const container = document.getElementById('variant-options');

  if (!container || state.variants.length === 0) return;

  const html = state.variants
    .map((v, index) => {
      const isSelected =
        state.selectedVariant && state.selectedVariant.id === v.id;
      const activeClass = isSelected
        ? 'border-[#0A2A45] bg-[#0A2A45] text-white dark:border-blue-500 dark:bg-blue-600'
        : 'border-gray-300 text-gray-700 hover:border-[#0A2A45] dark:border-slate-600 dark:text-gray-300';

      return `
            <button onclick="selectVariant(${index})" 
                class="px-4 py-2 border rounded-lg text-sm font-bold transition-all ${activeClass}">
                ${v.size}
            </button>
        `;
    })
    .join('');

  container.innerHTML = `
        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase">Kích thước:</h4>
        <div class="flex gap-3 flex-wrap">${html}</div>
    `;
};

// Hàm chọn Variant (Gán window)
window.selectVariant = (index) => {
  state.selectedVariant = state.variants[index];
  renderVariants(); // Re-render để update class active
  updatePriceDisplay(); // Update giá tiền
};

// Hàm Thêm vào giỏ (Logic Quan Trọng)
window.addToCart = () => {
  if (!state.selectedVariant && state.variants.length > 0) {
    Swal.fire({ icon: 'warning', title: 'Vui lòng chọn kích thước!' });
    return;
  }

  const qtyInput = document.getElementById('qty-input');
  const qty = qtyInput ? parseInt(qtyInput.value) : 1;

  // Tạo object sản phẩm để lưu vào giỏ
  // Lưu ý: ID trong giỏ hàng nên là ID của VARIANT để phân biệt (hoặc kết hợp product_id + size)
  const cartItem = {
    id: state.selectedVariant ? state.selectedVariant.id : state.product.id, // Dùng Variant ID
    product_id: state.product.id,
    name: `${state.product.name} (${
      state.selectedVariant ? state.selectedVariant.size : 'Standard'
    })`,
    price: state.selectedVariant
      ? Number(state.selectedVariant.price)
      : Number(state.product.price),
    image: state.product.image,
    size: state.selectedVariant ? state.selectedVariant.size : null,
    quantity: qty,
  };

  CartService.add(cartItem, qty); // Gọi Service thêm vào giỏ
};

// Helpers khác (Tăng giảm số lượng...)
window.updateQty = (change) => {
  const input = document.getElementById('qty-input');
  let newVal = parseInt(input.value) + change;
  if (newVal < 1) newVal = 1;
  input.value = newVal;
};

// ... Các logic Swiper, Render Gallery giữ nguyên như bài trước ...

document.addEventListener('DOMContentLoaded', initDetail);

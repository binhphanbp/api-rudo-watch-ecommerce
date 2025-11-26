import api, { getImageUrl } from '../services/api.js';
import CartService from '../services/cart.js'; // Import Cart Service
import { formatCurrency } from '../utils/format.js';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

let currentProduct = null;

const initDetail = async () => {
  if (!id) return;

  try {
    const res = await api.get(`/products/${id}`);
    const product = res.data.data || res.data;

    currentProduct = {
      ...product,
      price: Number(product.price),
      image: getImageUrl(product.image),
    };

    // Render Info
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-brand').textContent =
      product.brand_name || 'Thương hiệu';
    document.getElementById('product-price').textContent = formatCurrency(
      currentProduct.price
    );
    document.getElementById('main-image').src = currentProduct.image;

    // Render Gallery (Nếu API có mảng ảnh phụ, nếu không thì dùng ảnh chính lặp lại)
    // const images = product.images || [product.image];
    // ... Logic render thumb ...
  } catch (error) {
    console.error(error);
    // Chuyển về 404 hoặc thông báo
  }
};

// Gắn hàm vào window để HTML gọi được
window.addToCart = () => {
  if (!currentProduct) return;
  const qty = parseInt(document.getElementById('qty-input').value) || 1;

  CartService.add(currentProduct, qty); // Gọi service lưu LocalStorage
};

document.addEventListener('DOMContentLoaded', initDetail);

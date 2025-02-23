  // ===============================
  // Carrito
  // ===============================
  let cart = [];
  function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      cart = JSON.parse(storedCart);
      updateCartModal();
    }
  }
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    updateCartModal();
  }
  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartModal();
  }
  function updateQuantity(id, delta) {
    const product = cart.find(item => item.id === id);
    if (product) {
      product.quantity += delta;
      if (product.quantity <= 0) {
        removeFromCart(id);
        return;
      }
    }
    updateCartModal();
  }
  function clearCart() {
    cart = [];
    updateCartModal();
  }
  function updateCartModal() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>
          <button class="btn btn-sm btn-secondary me-1" onclick="updateQuantity('${item.id}', -1)">-</button>
          ${item.quantity}
          <button class="btn btn-sm btn-secondary ms-1" onclick="updateQuantity('${item.id}', 1)">+</button>
        </td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${subtotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      cartItemsEl.appendChild(tr);
    });
    cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
    saveCart();
  }
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      const price = parseFloat(this.getAttribute('data-price'));
      addToCart(id, name, price);
      new bootstrap.Toast(document.getElementById('cartToast')).show();
    });
  });

  // ===============================
  // Favoritos
  // ===============================
  let favorites = [];
  function loadFavorites() {
    const storedFav = localStorage.getItem('favorites');
    if (storedFav) {
      favorites = JSON.parse(storedFav);
    }
  }
  function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  function isFavorite(id) {
    return favorites.some(fav => fav.id === id);
  }
  function toggleFavorite(id, name, price) {
    if (isFavorite(id)) {
      favorites = favorites.filter(fav => fav.id !== id);
    } else {
      favorites.push({ id, name, price });
    }
    updateFavoriteButtons();
    updateFavoritesModal();
    saveFavorites();
  }
  function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      const id = btn.getAttribute('data-id');
      if (isFavorite(id)) {
        btn.innerHTML = '<i class="fas fa-heart text-danger"></i>';
      } else {
        btn.innerHTML = '<i class="far fa-heart"></i>';
      }
    });
  }
  function updateFavoritesModal() {
    const favModalBody = document.getElementById('favoritesModalBody');
    favModalBody.innerHTML = '';
    if (favorites.length === 0) {
      favModalBody.innerHTML = '<p>No hay productos favoritos.</p>';
    } else {
      const list = document.createElement('ul');
      list.className = 'list-group';
      favorites.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${item.name} <button class="btn btn-sm btn-danger" onclick="toggleFavorite('${item.id}', '${item.name}', ${item.price})"><i class="fas fa-trash-alt"></i></button>`;
        list.appendChild(li);
      });
      favModalBody.appendChild(list);
    }
  }
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      const price = parseFloat(this.getAttribute('data-price'));
      toggleFavorite(id, name, price);
    });
  });

  // ===============================
  // Filtrado y Ordenamiento
  // ===============================
  function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const products = document.querySelectorAll('#productsContainer > .col-md-4');
    products.forEach(product => {
      const name = product.getAttribute('data-name').toLowerCase();
      const category = product.getAttribute('data-category');
      if (name.includes(searchTerm) && (categoryFilter === "" || category === categoryFilter)) {
        product.style.display = '';
      } else {
        product.style.display = 'none';
      }
    });
  }
  function sortProducts(criteria) {
    const container = document.getElementById('productsContainer');
    const products = Array.from(container.children).filter(prod => prod.style.display !== 'none');
    if (criteria === 'precioAsc') {
      products.sort((a, b) => {
        let priceA = parseFloat(a.querySelector('.add-to-cart').getAttribute('data-price'));
        let priceB = parseFloat(b.querySelector('.add-to-cart').getAttribute('data-price'));
        return priceA - priceB;
      });
    } else if (criteria === 'precioDesc') {
      products.sort((a, b) => {
        let priceA = parseFloat(a.querySelector('.add-to-cart').getAttribute('data-price'));
        let priceB = parseFloat(b.querySelector('.add-to-cart').getAttribute('data-price'));
        return priceB - priceA;
      });
    }
    products.forEach(product => container.appendChild(product));
  }
  document.getElementById('searchInput').addEventListener('input', filterProducts);
  document.getElementById('filterCategory').addEventListener('change', filterProducts);
  document.getElementById('sortProducts').addEventListener('change', function() {
    sortProducts(this.value);
  });
  // ===============================
  // Funcionalidad de Ofertas
  // ===============================
  function filterOffers() {
    const products = document.querySelectorAll('#productsContainer > .col-md-4');
    products.forEach(product => {
      if(product.getAttribute('data-offer') === "true") {
        product.style.display = '';
      } else {
        product.style.display = 'none';
      }
    });
  }
  function showAllProducts() {
    const products = document.querySelectorAll('#productsContainer > .col-md-4');
    products.forEach(product => {
      product.style.display = '';
    });
  }
  
  // Evento para el enlace "Ofertas" en el navbar
  document.getElementById('offersLink').addEventListener('click', function(e) {
    e.preventDefault();
    filterOffers();
    window.scrollTo({ top: document.getElementById('productsContainer').offsetTop, behavior: 'smooth' });
  });
  // Botón "Mostrar Todos" para restablecer vista
  document.getElementById('showAllBtn').addEventListener('click', function() {
    showAllProducts();
  });

  // ===============================
  // Checkout
  // ===============================
  document.getElementById('btnCheckout').addEventListener('click', function() {
    const cartModalEl = document.getElementById('cartModal');
    const cartModal = bootstrap.Modal.getInstance(cartModalEl);
    cartModal.hide();
    new bootstrap.Modal(document.getElementById('checkoutModal')).show();
  });
  document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    clearCart();
    const checkoutModalEl = document.getElementById('checkoutModal');
    const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl);
    checkoutModal.hide();
    new bootstrap.Toast(document.getElementById('orderToast')).show();
    this.reset();
  });
  // ===============================
  // Back to Top
  // ===============================
  const backToTopButton = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTopButton.style.display = (window.scrollY > 300) ? 'block' : 'none';
  });
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  });
  // ===============================
  // Cargar Datos al Inicio
  // ===============================
  loadCart();
  loadFavorites();
  updateFavoriteButtons();
  updateFavoritesModal();

// ===============================
// Paginación
// ===============================
const productsPerPage = 3;
let currentPage = 1;

function paginateProducts() {
  const products = document.querySelectorAll('#productsContainer > .col-md-4');
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginationEl = document.getElementById('pagination');
  const maxVisiblePages = 5; // Número máximo de páginas visibles

  // Limpiar la paginación existente
  paginationEl.innerHTML = '';

  // Botón "Anterior"
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
  prevLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      paginateProducts();
    }
  });
  paginationEl.appendChild(prevLi);

  // Crear botones de paginación
  let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      paginateProducts();
    });
    paginationEl.appendChild(li);
  }

  // Botón "Siguiente"
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
  nextLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      paginateProducts();
    }
  });
  paginationEl.appendChild(nextLi);

  // Mostrar productos de la página actual
  showPage();
}

function showPage() {
  const products = document.querySelectorAll('#productsContainer > .col-md-4');
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  products.forEach((product, index) => {
    product.style.display = (index >= start && index < end) ? '' : 'none';
  });

  // Actualizar la paginación activa
  const paginationItems = document.querySelectorAll('#pagination .page-item');
  paginationItems.forEach((item, index) => {
    item.classList.toggle('active', index === currentPage);
  });
}

// Llamar a la función de paginación al cargar la página
document.addEventListener('DOMContentLoaded', paginateProducts);







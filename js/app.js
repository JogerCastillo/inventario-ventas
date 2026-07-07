(function () {
  'use strict';

  var API_BASE_URL = 'https://inventario-ventas-api.onrender.com/api';
  var STORAGE_PRODUCTS = 'inventario_ventas_productos';
  var STORAGE_SALES = 'inventario_ventas_ventas';
  var AUTH_TOKEN_KEY = 'inventario_ventas_auth_token';
  var AUTH_USER_KEY = 'inventario_ventas_auth_user';

  var authPanel = document.getElementById('auth-panel');
  var lockedPanel = document.getElementById('locked-panel');
  var authForm = document.getElementById('auth-form');
  var authEmailInput = document.getElementById('auth-email');
  var authPasswordInput = document.getElementById('auth-password');
  var logoutButton = document.getElementById('logout-btn');
  var sessionChip = document.getElementById('session-chip');
  var sessionUser = document.getElementById('session-user');

  var productPanel = document.getElementById('product-panel');
  var salePanel = document.getElementById('sale-panel');

  var productForm = document.getElementById('product-form');
  var productIdInput = document.getElementById('product-id');
  var productNameInput = document.getElementById('product-name');
  var productSkuInput = document.getElementById('product-sku');
  var productCategoryInput = document.getElementById('product-category');
  var productPriceInput = document.getElementById('product-price');
  var productStockInput = document.getElementById('product-stock');
  var productMinStockInput = document.getElementById('product-min-stock');
  var productSubmitButton = document.getElementById('product-submit');
  var productCancelButton = document.getElementById('product-cancel');

  var saleForm = document.getElementById('sale-form');
  var saleProductSelect = document.getElementById('sale-product');
  var saleQuantityInput = document.getElementById('sale-quantity');
  var saleDateInput = document.getElementById('sale-date');

  var inventorySearchInput = document.getElementById('inventory-search');
  var inventoryBody = document.getElementById('inventory-body');
  var salesBody = document.getElementById('sales-body');
  var inventoryEmpty = document.getElementById('inventory-empty');
  var salesEmpty = document.getElementById('sales-empty');

  var inventoryRowTemplate = document.getElementById('inventory-row-template');
  var salesRowTemplate = document.getElementById('sales-row-template');

  var kpiGrid = document.querySelector('.kpi-grid');
  var inventoryPanel = document.getElementById('inventory-title').closest('.panel');
  var salesPanel = document.getElementById('sales-title').closest('.panel');
  var dataSourceStatus = document.getElementById('data-source-status');

  var kpiProducts = document.getElementById('kpi-products');
  var kpiStock = document.getElementById('kpi-stock');
  var kpiSales = document.getElementById('kpi-sales');
  var kpiIncome = document.getElementById('kpi-income');
  var kpiLowStock = document.getElementById('kpi-low-stock');

  var products = [];
  var sales = [];
  var dataSource = 'local';
  var authToken = '';
  var currentUser = null;

  function loadArray(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveLocalData() {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_SALES, JSON.stringify(sales));
  }

  function saveAuthSession(token, user) {
    authToken = token || '';
    currentUser = user || null;

    if (authToken && currentUser) {
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
      return;
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  function restoreAuthSession() {
    var token = localStorage.getItem(AUTH_TOKEN_KEY);
    var userRaw = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !userRaw) {
      saveAuthSession('', null);
      return;
    }

    try {
      saveAuthSession(token, JSON.parse(userRaw));
    } catch (error) {
      saveAuthSession('', null);
    }
  }

  function seedIfNeeded() {
    if (products.length > 0) return;

    products = [
      {
        id: 'p-1',
        name: 'Audifonos Pro X1',
        sku: 'AUD-X1',
        category: 'Tecnologia',
        price: 220000,
        stock: 14,
        minStock: 6,
        createdAt: new Date().toISOString()
      },
      {
        id: 'p-2',
        name: 'Mouse Ergonomico M70',
        sku: 'MOU-M70',
        category: 'Accesorios',
        price: 98000,
        stock: 10,
        minStock: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: 'p-3',
        name: 'Teclado Mecanico K90',
        sku: 'KEY-K90',
        category: 'Perifericos',
        price: 310000,
        stock: 4,
        minStock: 4,
        createdAt: new Date().toISOString()
      }
    ];

    sales = [
      {
        id: 's-1',
        productId: 'p-1',
        productName: 'Audifonos Pro X1',
        quantity: 2,
        unitPrice: 220000,
        total: 440000,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      }
    ];

    saveLocalData();
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function formatDate(isoDate) {
    var date = new Date(isoDate + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return isoDate;

    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function updateDataSourceLabel() {
    if (!dataSourceStatus) return;

    if (dataSource === 'api') {
      dataSourceStatus.textContent = 'API conectada';
      return;
    }

    dataSourceStatus.textContent = 'Operando en local';
  }

  function setMainVisibility(enabled) {
    kpiGrid.hidden = !enabled;
    productPanel.hidden = !enabled;
    salePanel.hidden = !enabled;
    inventoryPanel.hidden = !enabled;
    salesPanel.hidden = !enabled;
  }

  function applyRoleRestrictions() {
    if (dataSource !== 'api' || !currentUser) {
      productPanel.hidden = false;
      return;
    }

    productPanel.hidden = currentUser.role !== 'admin';
  }

  function updateSessionUi() {
    var isApiMode = dataSource === 'api';
    var hasSession = !!authToken && !!currentUser;

    authPanel.hidden = !isApiMode || hasSession;
    lockedPanel.hidden = !isApiMode || hasSession;
    sessionChip.hidden = !isApiMode || !hasSession;

    if (hasSession) {
      sessionUser.textContent = currentUser.name + ' (' + currentUser.role + ')';
    } else {
      sessionUser.textContent = '';
    }

    if (!isApiMode) {
      setMainVisibility(true);
      return;
    }

    setMainVisibility(hasSession);
    applyRoleRestrictions();
  }

  async function requestApi(path, options) {
    var requestOptions = options || {};
    var headers = requestOptions.headers || {};

    if (authToken) {
      headers.Authorization = 'Bearer ' + authToken;
    }

    requestOptions.headers = headers;

    var response = await fetch(API_BASE_URL + path, requestOptions);

    if (!response.ok) {
      var message = 'No se pudo completar la solicitud.';
      try {
        var payload = await response.json();
        message = payload.message || message;
      } catch (error) {
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function detectApiAvailability() {
    try {
      await fetch(API_BASE_URL + '/health');
      dataSource = 'api';
    } catch (error) {
      dataSource = 'local';
    }

    updateDataSourceLabel();
  }

  async function validateApiSession() {
    if (dataSource !== 'api') {
      saveAuthSession('', null);
      return;
    }

    restoreAuthSession();
    if (!authToken) return;

    try {
      var response = await requestApi('/auth/me');
      saveAuthSession(authToken, response.user);
    } catch (error) {
      saveAuthSession('', null);
    }
  }

  function getProductFormData() {
    return {
      id: productIdInput.value,
      name: productNameInput.value.trim(),
      sku: productSkuInput.value.trim().toUpperCase(),
      category: productCategoryInput.value.trim(),
      price: Number(productPriceInput.value),
      stock: Number(productStockInput.value),
      minStock: Number(productMinStockInput.value)
    };
  }

  function validateProduct(data) {
    if (!data.name || !data.sku || !data.category) {
      return 'Completa nombre, SKU y categoria.';
    }

    if (Number.isNaN(data.price) || data.price < 0) {
      return 'Ingresa un precio valido.';
    }

    if (Number.isNaN(data.stock) || data.stock < 0) {
      return 'Ingresa un stock valido.';
    }

    if (Number.isNaN(data.minStock) || data.minStock < 0) {
      return 'Ingresa un stock minimo valido.';
    }

    var duplicateSku = products.some(function (item) {
      return item.sku === data.sku && item.id !== data.id;
    });

    if (duplicateSku) {
      return 'El SKU ya existe en otro producto.';
    }

    return null;
  }

  function resetProductForm() {
    productForm.reset();
    productIdInput.value = '';
    productSubmitButton.textContent = 'Guardar producto';
  }

  function fillProductForm(product) {
    productIdInput.value = product.id;
    productNameInput.value = product.name;
    productSkuInput.value = product.sku;
    productCategoryInput.value = product.category;
    productPriceInput.value = String(product.price);
    productStockInput.value = String(product.stock);
    productMinStockInput.value = String(product.minStock);
    productSubmitButton.textContent = 'Actualizar producto';
    productNameInput.focus();
  }

  function sortProducts() {
    products.sort(function (a, b) {
      return a.name.localeCompare(b.name, 'es');
    });
  }

  function sortSales() {
    sales.sort(function (a, b) {
      var left = new Date(a.date + 'T00:00:00').getTime();
      var right = new Date(b.date + 'T00:00:00').getTime();
      return right - left;
    });
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    var email = authEmailInput.value.trim();
    var password = authPasswordInput.value;

    if (!email || !password) {
      alert('Ingresa correo y contrasena.');
      return;
    }

    try {
      var response = await requestApi('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      saveAuthSession(response.token, response.user);
      authForm.reset();
      updateSessionUi();
      await refreshAll();
    } catch (error) {
      alert(error.message || 'No se pudo iniciar sesion.');
    }
  }

  function handleLogout() {
    saveAuthSession('', null);
    products = [];
    sales = [];
    inventoryBody.innerHTML = '';
    salesBody.innerHTML = '';
    updateSessionUi();
    renderKpi();
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    var data = getProductFormData();
    var error = validateProduct(data);
    if (error) {
      alert(error);
      return;
    }

    try {
      if (dataSource === 'api') {
        if (currentUser && currentUser.role !== 'admin') {
          alert('No tienes permisos para gestionar productos.');
          return;
        }

        var payload = {
          name: data.name,
          sku: data.sku,
          category: data.category,
          price: data.price,
          stock: data.stock,
          minStock: data.minStock
        };

        if (data.id) {
          await requestApi('/products/' + data.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          await requestApi('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } else if (data.id) {
        var editIndex = products.findIndex(function (item) {
          return item.id === data.id;
        });

        if (editIndex !== -1) {
          products[editIndex] = {
            id: products[editIndex].id,
            createdAt: products[editIndex].createdAt,
            name: data.name,
            sku: data.sku,
            category: data.category,
            price: data.price,
            stock: data.stock,
            minStock: data.minStock
          };
        }
      } else {
        products.push({
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          name: data.name,
          sku: data.sku,
          category: data.category,
          price: data.price,
          stock: data.stock,
          minStock: data.minStock,
          createdAt: new Date().toISOString()
        });
      }

      if (dataSource === 'local') {
        saveLocalData();
      }

      resetProductForm();
      await refreshAll();
    } catch (requestError) {
      alert(requestError.message || 'No se pudo guardar el producto.');
    }
  }

  async function handleProductRowAction(event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;

    var row = button.closest('tr');
    if (!row) return;

    var productId = row.getAttribute('data-product-id');
    var action = button.getAttribute('data-action');

    var index = products.findIndex(function (item) {
      return item.id === productId;
    });

    if (index === -1) return;

    if (action === 'edit') {
      if (dataSource === 'api' && currentUser && currentUser.role !== 'admin') {
        return;
      }
      fillProductForm(products[index]);
      return;
    }

    if (action === 'delete') {
      if (dataSource === 'api' && currentUser && currentUser.role !== 'admin') {
        return;
      }

      var linkedSale = sales.some(function (sale) {
        return sale.productId === productId;
      });

      if (linkedSale) {
        alert('No puedes eliminar este producto porque tiene ventas registradas.');
        return;
      }

      var confirmed = window.confirm('Se eliminara el producto seleccionado.');
      if (!confirmed) return;

      try {
        if (dataSource === 'api') {
          await requestApi('/products/' + productId, { method: 'DELETE' });
        } else {
          products.splice(index, 1);
          saveLocalData();
        }

        await refreshAll();
      } catch (requestError) {
        alert(requestError.message || 'No se pudo eliminar el producto.');
      }
    }
  }

  function getSaleFormData() {
    return {
      productId: saleProductSelect.value,
      quantity: Number(saleQuantityInput.value),
      date: saleDateInput.value
    };
  }

  async function handleSaleSubmit(event) {
    event.preventDefault();

    var data = getSaleFormData();

    if (!data.productId) {
      alert('Selecciona un producto para registrar la venta.');
      return;
    }

    if (Number.isNaN(data.quantity) || data.quantity <= 0) {
      alert('Ingresa una cantidad valida.');
      return;
    }

    if (!data.date) {
      alert('Selecciona una fecha para la venta.');
      return;
    }

    try {
      if (dataSource === 'api') {
        await requestApi('/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: data.productId,
            quantity: data.quantity,
            date: data.date
          })
        });
      } else {
        var product = products.find(function (item) {
          return item.id === data.productId;
        });

        if (!product) {
          alert('Producto no encontrado.');
          return;
        }

        if (data.quantity > product.stock) {
          alert('La cantidad supera el stock disponible.');
          return;
        }

        product.stock = product.stock - data.quantity;

        sales.push({
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          productId: product.id,
          productName: product.name,
          quantity: data.quantity,
          unitPrice: product.price,
          total: product.price * data.quantity,
          date: data.date,
          createdAt: new Date().toISOString()
        });

        saveLocalData();
      }

      saleForm.reset();
      saleDateInput.value = new Date().toISOString().slice(0, 10);
      saleQuantityInput.value = '1';
      await refreshAll();
    } catch (requestError) {
      alert(requestError.message || 'No se pudo registrar la venta.');
    }
  }

  function renderSaleProductOptions() {
    sortProducts();
    saleProductSelect.innerHTML = '';

    if (products.length === 0) {
      var fallbackOption = document.createElement('option');
      fallbackOption.value = '';
      fallbackOption.textContent = 'No hay productos disponibles';
      saleProductSelect.appendChild(fallbackOption);
      saleProductSelect.disabled = true;
      return;
    }

    saleProductSelect.disabled = false;

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecciona un producto';
    saleProductSelect.appendChild(placeholder);

    products.forEach(function (product) {
      var option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name + ' | Stock: ' + product.stock;
      saleProductSelect.appendChild(option);
    });
  }

  function resolveStockState(product) {
    if (product.stock <= 0) {
      return { text: 'Sin stock', className: 'status-pill status-pill--danger' };
    }

    if (product.stock <= product.minStock) {
      return { text: 'Stock bajo', className: 'status-pill status-pill--warn' };
    }

    return { text: 'Disponible', className: 'status-pill status-pill--ok' };
  }

  function renderInventoryTable() {
    var query = inventorySearchInput.value.trim().toLowerCase();

    var visibleProducts = products.filter(function (product) {
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });

    inventoryBody.innerHTML = '';

    if (visibleProducts.length === 0) {
      inventoryEmpty.classList.add('is-visible');
      return;
    }

    inventoryEmpty.classList.remove('is-visible');

    visibleProducts.forEach(function (product) {
      var node = inventoryRowTemplate.content.cloneNode(true);
      var row = node.querySelector('tr');
      row.setAttribute('data-product-id', product.id);

      node.querySelector('[data-name]').textContent = product.name;
      node.querySelector('[data-sku]').textContent = product.sku;
      node.querySelector('[data-category]').textContent = product.category;
      node.querySelector('[data-price]').textContent = formatMoney(product.price);
      node.querySelector('[data-stock]').textContent = String(product.stock);

      var status = resolveStockState(product);
      var statusNode = node.querySelector('[data-status]');
      statusNode.textContent = status.text;
      statusNode.className = status.className;

      if (dataSource === 'api' && currentUser && currentUser.role !== 'admin') {
        var editButton = node.querySelector('[data-action="edit"]');
        var deleteButton = node.querySelector('[data-action="delete"]');
        editButton.disabled = true;
        deleteButton.disabled = true;
        editButton.title = 'Solo admin puede editar productos';
        deleteButton.title = 'Solo admin puede eliminar productos';
        deleteButton.classList.remove('btn--table-danger');
        deleteButton.classList.add('btn--table');
      }

      inventoryBody.appendChild(node);
    });
  }

  function renderSalesTable() {
    sortSales();
    salesBody.innerHTML = '';

    if (sales.length === 0) {
      salesEmpty.classList.add('is-visible');
      return;
    }

    salesEmpty.classList.remove('is-visible');

    sales.forEach(function (sale) {
      var node = salesRowTemplate.content.cloneNode(true);
      node.querySelector('[data-date]').textContent = formatDate(sale.date);
      node.querySelector('[data-product]').textContent = sale.productName;
      node.querySelector('[data-quantity]').textContent = String(sale.quantity);
      node.querySelector('[data-unit-price]').textContent = formatMoney(sale.unitPrice);
      node.querySelector('[data-total]').textContent = formatMoney(sale.total);
      salesBody.appendChild(node);
    });
  }

  function renderKpi() {
    var totalProducts = products.length;
    var totalStock = products.reduce(function (sum, item) {
      return sum + item.stock;
    }, 0);

    var totalSales = sales.length;
    var totalIncome = sales.reduce(function (sum, item) {
      return sum + item.total;
    }, 0);

    var lowStockCount = products.filter(function (item) {
      return item.stock <= item.minStock;
    }).length;

    kpiProducts.textContent = String(totalProducts);
    kpiStock.textContent = String(totalStock);
    kpiSales.textContent = String(totalSales);
    kpiIncome.textContent = formatMoney(totalIncome);
    kpiLowStock.textContent = String(lowStockCount);
  }

  function render() {
    sortProducts();
    renderSaleProductOptions();
    renderInventoryTable();
    renderSalesTable();
    renderKpi();
  }

  async function refreshAll() {
    if (dataSource === 'api') {
      if (!authToken) {
        products = [];
        sales = [];
        render();
        return;
      }

      products = await requestApi('/products');
      sales = await requestApi('/sales');
    } else {
      products = loadArray(STORAGE_PRODUCTS);
      sales = loadArray(STORAGE_SALES);
      seedIfNeeded();
    }

    render();
  }

  function initEvents() {
    authForm.addEventListener('submit', handleAuthSubmit);
    logoutButton.addEventListener('click', handleLogout);

    productForm.addEventListener('submit', handleProductSubmit);
    productCancelButton.addEventListener('click', resetProductForm);

    saleForm.addEventListener('submit', handleSaleSubmit);
    inventorySearchInput.addEventListener('input', renderInventoryTable);

    inventoryBody.addEventListener('click', handleProductRowAction);
  }

  async function init() {
    await detectApiAvailability();
    await validateApiSession();
    updateSessionUi();
    initEvents();

    saleDateInput.value = new Date().toISOString().slice(0, 10);
    saleQuantityInput.value = '1';

    await refreshAll();
  }

  init().catch(function () {
    alert('No fue posible inicializar el sistema.');
  });
})();

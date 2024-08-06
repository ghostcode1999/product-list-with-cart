"use strict";

/*----------------------------
    - GENERAL HELPERS
-----------------------------*/

/** Select DOM elements */
const select = (selector, all = false) => {
  selector = selector.trim();

  return all
    ? [...document.querySelectorAll(selector)]
    : document.querySelector(selector);
};

/** Attach an event listener to an element */
const on = (eventType, selector, listener, all = false) => {
  selector = typeof selector === "string" ? select(selector, all) : selector;

  if (selector) {
    if (all || selector.length > 1) {
      selector.forEach((element) =>
        element.addEventListener(eventType, listener)
      );
    } else {
      selector.addEventListener(eventType, listener);
    }
  }
};

/** Add / Remove / Toggle classes */
function addClass(selector, className) {
  if (selector.length > 1) {
    selector.forEach((el) => el.classList.add(className));
    return;
  }

  selector.classList.add(className);
}

function removeClass(selector, className) {
  if (selector.length > 1) {
    selector.forEach((el) => el.classList.remove(className));
    return;
  }

  selector.classList.remove(className);
}

function toggleClass(selector, className) {
  if (selector.length > 1) {
    selector.forEach((el) => el.classList.toggle(className));
    return;
  }

  selector.classList.toggle(className);
}

/** Format a number into a string of 2 digits after decimal */
function formatCurrency(price) {
  return price.toFixed(2);
}

//# Select needed DOM elements

const productsList = select(".product-list");
const cartWrapper = select(".cart-wrapper");
const confirmationModal = select(".confirmation-modal");
const orderList = confirmationModal.querySelector(".order-list");

//# Main variables
const cart = [];
let products;

/** The code below is used to add a unique random ID for each product in data.json file */

// Read the data.json file
// fetch("data.json")
//   .then((response) => response.json())
//   .then((data) => {
//     // Generate unique random IDs for each product
//     const updatedData = data.map((product) => ({
//       ...product,
//       id: Math.random().toString(36).substring(2, 11),
//     }));

//     // Write the updated data back to data.json
//     const jsonString = JSON.stringify(updatedData, null, 2);
//     const blob = new Blob([jsonString], { type: "application/json" });
//     const fileURL = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = fileURL;
//     link.download = "data.json";
//     link.click();
//   });

/*----------------------------
    - PRODUCTS HELPERS
-----------------------------*/

/** Load products */
function loadProducts() {
  // Fetch the data.json file
  return fetch("updated-data.json")
    .then((response) => response.json())
    .then((data) => (products = data));
}

/** Find a product by its unique id */
function findMatchingProduct(productId) {
  return products.find((product) => product.id === productId);
}

/*----------------------------
    - CART HELPERS
-----------------------------*/

/** Add a product to cart */
function addToCart(productId) {
  // Find the product
  const product = findMatchingProduct(productId);
  if (!product) {
    return;
  }
  // If the product is already in the cart
  if (cart.some((item) => item.id === product.id)) {
    cart.find((item) => item.id === product.id).quantity++;
    return;
  }

  // If the product is not in the cart
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
  };

  cart.push(cartItem);
  cart.sort((a, b) => a.name.localeCompare(b.name, navigator.language));
}

/** Calculate cart total quantity */
function calculateTotalQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/** Calculate cart total price */
function calculateTotalPrice() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

/** Generate products HTML */
function generateProductsHTML() {
  let productsHTML = "";

  products.forEach((product) => {
    productsHTML += `
        <li class="product-item">
            <div class="product-image-wrapper">
              <picture class="product-image">
                <source
                  media="(min-width: 768px)"
                  srcset=${product.image.tablet}
                />
                <source
                  media="(min-width: 992px)"
                  srcset=${product.image.desktop}
                />
                <img
                  src=${product.image.mobile}
                  alt="${product.name}"
                />
              </picture>
              <div class="product-action">
                <button class="btn | add-to-cart-btn" data-type="primary" data-product-id=${
                  product.id
                }>
                <img src="assets/images/icon-add-to-cart.svg" alt="" />Add to
                Cart
              </button>
              <div class="quantity-selector btn is-hidden" data-product-id=${
                product.id
              }>
                <button class="quantity-btn decrement-btn" disabled aria-label="Decrement quantity">
                  <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
                </button>
                <span class="quantity-value">1</span>
                <button class="quantity-btn increment-btn" aria-label="Increment quantity">
                  <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
                </button>
              </div>
              </div>
            </div>
            <p class="product-category">${product.category}</p>
            <h4 class="product-name">${product.name}</h4>
            <p class="product-price">$${formatCurrency(product.price)}</p>
          </li>
        `;
  });

  productsList.innerHTML = productsHTML;

  on(
    "click",
    ".add-to-cart-btn",
    function () {
      const productId = this.dataset.productId;
      const quantitySelector = this.nextElementSibling;
      addToCart(productId);
      generateCartHTML();
      addClass(quantitySelector, "is-shown");
    },
    true
  );

  on(
    "click",
    ".decrement-btn",
    function () {
      const productId = this.parentElement.dataset.productId;
      const cartItem = cart.find((item) => item.id === productId);

      const quantityValue = this.nextElementSibling;
      const quantity = parseFloat(quantityValue.textContent);

      if (quantity > 1) {
        cartItem.quantity--;
        quantityValue.textContent = cartItem.quantity;
        this.disabled = false;
      }

      if (quantity === 1) {
        this.disabled = true;
      }

      generateCartHTML();
    },
    true
  );

  on(
    "click",
    ".increment-btn",
    function () {
      const productId = this.parentElement.dataset.productId;
      const cartItem = cart.find((item) => item.id === productId);

      const quantityValue = this.previousElementSibling;
      const quantity = parseFloat(quantityValue.textContent);

      cartItem.quantity++;
      quantityValue.textContent = cartItem.quantity;

      const decrementBtn = quantityValue.previousElementSibling;
      if (quantity === 2) {
        decrementBtn.disabled = false;
      }

      generateCartHTML();
    },
    true
  );
}

/** Generate cart HTML */
function generateCartHTML() {
  let cartHTML = "";

  // Update cart quantity
  select(".cart-quantity span").innerHTML = calculateTotalQuantity();

  if (cart.length) {
    let cartListHTML = "";

    cart.forEach((cartItem) => {
      const itemTotalPrice = formatCurrency(cartItem.quantity * cartItem.price);

      cartListHTML += `
      <li class="cart-item | item">
            <div class="cart-item-info | item-info">
              <h3 class="cart-item-name | item-name">${cartItem.name}</h3>
              <div class="cart-item-quantity-price | item-quantity-price">
                <span class="cart-item-quantity | item-quantity">${
                  cartItem.quantity
                }x</span>
                <span class="cart-item-price | item-price">@ $${formatCurrency(
                  cartItem.price
                )}</span>
                <span class="cart-item-total-price | item-total-price"
                  >$${itemTotalPrice}</span
                >
              </div>
            </div>
            <button class="remove-item-btn" aria-label="Remove item" data-item-id=${
              cartItem.id
            }>
              <svg
                class="btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                fill="none"
                viewBox="0 0 10 10"
              >
                <path
                  fill="#CAAFA7"
                  d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"
                />
              </svg>
            </button>
          </li>
      `;
    });

    cartHTML += `
        <ul class="cart-items-list">
        ${cartListHTML}
        </ul>
        <div class="cart-total-price | total-price">
          <p>Order Total:</p>
          <span>$${formatCurrency(calculateTotalPrice())}</span>
        </div>
        <p class="carbon-neutral">
          <img
            src="assets/images/icon-carbon-neutral.svg"
            alt="Icon carbon neutral"
          />
          This is a <span>carbon-neutral</span> delivery
        </p>
        <button class="btn | confirm-btn" data-type="accent">
          Confirm Order
        </button>
    
    `;
  }

  cartWrapper.innerHTML =
    cartHTML ||
    `
  <div class="cart-empty-message">
          <img src="assets/images/illustration-empty-cart.svg" alt="" />
          <p>Your added items will appear here</p>
        </div>
  `;

  const removeBtns = select(".remove-item-btn", true);
  if (removeBtns) {
    on(
      "click",
      removeBtns,
      function () {
        // Remove the item
        const itemId = this.dataset.itemId;
        const index = cart.findIndex((item) => item.id === itemId);
        cart.splice(index, 1);
        generateCartHTML();

        // Hide quantity selector
        const quantitySelector = select(
          `.quantity-selector[data-product-id="${itemId}"]`
        );
        if (quantitySelector) {
          removeClass(quantitySelector, "is-shown");
          // Reset quantity value to 1
          quantitySelector.querySelector(".quantity-value").textContent = 1;
        }
      },
      true
    );
  }

  const confirmBtn = select(".confirm-btn");

  on("click", confirmBtn, () => {
    generateModalHTML();
    addClass(confirmationModal, "is-shown");
  });
}

/** Generate confirmation modal HTML */
function generateModalHTML() {
  let orderListHTML = "";

  cart.forEach((cartItem) => {
    const itemId = cartItem.id;
    const matchingProduct = findMatchingProduct(itemId);

    const itemTotalPrice = formatCurrency(cartItem.quantity * cartItem.price);

    orderListHTML += `
    
              <li class="order-item | item">
                <img
                  class="order-item-image"
                  src="${matchingProduct.image.thumbnail}"
                  alt="${cartItem.name}"
                />
                <div>
                  <h3 class="order-item-name | item-name">
                    ${cartItem.name}
                  </h3>
                  <span class="order-item-quantity | item-quantity">${
                    cartItem.quantity
                  }x</span>
                  <span class="order-item-price | item-price">@ $${formatCurrency(
                    cartItem.price
                  )}</span>
                </div>
                <span class="order-item-total-price | item-total-price"
                  >$${itemTotalPrice}</span
                >
              </li>
    `;
  });

  orderList.innerHTML = orderListHTML;

  select(".order-total-price span").innerHTML = `$${formatCurrency(
    calculateTotalPrice()
  )}`;

  const resetBtn = select(".reset-btn");
  const quantitySelectors = select(".quantity-selector", true);

  on("click", resetBtn, () => {
    cart.length = 0;
    generateCartHTML();
    quantitySelectors.forEach((quantitySelector) => {
      removeClass(quantitySelector, "is-shown");
      quantitySelector.querySelector(".quantity-value").textContent = 1;
    });
    // Close the modal
    removeClass(confirmationModal, "is-shown");
  });
}

async function loadPage() {
  await loadProducts();
  generateProductsHTML();
  generateCartHTML();
}

loadPage();

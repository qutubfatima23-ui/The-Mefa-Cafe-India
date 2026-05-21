// Frontend Main Logic

let cart = [];
let currentUser = null;
let currentOrder = null;

// Load user from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUserButton();
    }
    filterMenu('shawarma');
    populateComboSelects();
});

// Filter Menu
function filterMenu(category) {
    document.querySelectorAll('.menu-tab').forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const container = document.getElementById('menu-container');
    container.innerHTML = '<div class="loader" style="display: block; grid-column: 1 / -1;"></div>';

    setTimeout(() => {
        const items = menuData[category];
        container.innerHTML = '';
        items.forEach(item => {
            const tagHTML = item.tag ? `<span class="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide inline-block mb-1">${item.tag}</span>` : '';
            const itemHTML = `
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            ${tagHTML}
                            <h4 class="font-bold text-lg text-gray-900 mt-2">${item.name}</h4>
                        </div>
                        <span class="text-lg font-black text-orange-600 whitespace-nowrap">₹${item.price}</span>
                    </div>
                    <p class="text-sm text-gray-500 mb-3">${item.desc}</p>
                    <button onclick="addToCart('${item.name}', ${item.price})" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
    }, 500);
}

// Add to Cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1
        });
    }
    
    updateCart();
    alert(`${name} added to cart!`);
}

// Update Cart Display
function updateCart() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;

    const cartItemsContainer = document.getElementById('cart-items');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-gray-500">Your cart is empty</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                <div>
                    <p class="font-bold text-sm">${item.name}</p>
                    <p class="text-xs text-gray-600">₹${item.price} x ${item.quantity}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="updateQuantity(${index}, -1)" class="text-orange-500 font-bold">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)" class="text-orange-500 font-bold">+</button>
                    <button onclick="removeFromCart(${index})" class="text-red-500 ml-2">✕</button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
}

// Update Quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCart();
    }
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Cart Modal Functions
function openCart() {
    document.getElementById('cart-modal').classList.remove('hidden');
}

function closeCart() {
    document.getElementById('cart-modal').classList.add('hidden');
}

document.getElementById('cart-btn').addEventListener('click', openCart);

// Auth Functions
function openAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function toggleAuthForm() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
    document.getElementById('auth-title').textContent = 
        document.getElementById('login-form').classList.contains('hidden') ? 'Register' : 'Login';
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await api.login(email, password);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            currentUser = response.user;
            updateUserButton();
            closeAuthModal();
            alert('Login successful!');
        } else {
            alert(response.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    if (!name || !email || !phone || !password) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await api.register({ name, email, phone, password });
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            currentUser = response.user;
            updateUserButton();
            closeAuthModal();
            alert('Registration successful!');
        } else {
            alert(response.errors ? response.errors[0].msg : 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed');
    }
}

function updateUserButton() {
    const userBtn = document.getElementById('user-btn');
    if (currentUser) {
        userBtn.innerHTML = `
            <div class="flex items-center gap-2">
                <span>${currentUser.name}</span>
                <div class="relative group">
                    <i class="fas fa-user-circle text-xl cursor-pointer"></i>
                    <div class="absolute right-0 mt-2 w-40 bg-white text-gray-900 rounded-lg shadow-lg hidden group-hover:block">
                        <a href="orders.html" class="block px-4 py-2 hover:bg-gray-100">My Orders</a>
                        <button onclick="logout()" class="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        userBtn.textContent = 'Login';
        userBtn.onclick = openAuthModal;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateUserButton();
    alert('Logged out successfully!');
}

document.getElementById('user-btn').addEventListener('click', () => {
    if (!currentUser) openAuthModal();
});

// Combo Builder
function populateComboSelects() {
    const mainSelect = document.getElementById('combo-main');
    const sideSelect = document.getElementById('combo-side');
    const drinkSelect = document.getElementById('combo-drink');

    // Add main items (shawarmas, burgers, wraps)
    [...menuData.shawarma, ...menuData.burgers, ...menuData.wraps].forEach(item => {
        const option = document.createElement('option');
        option.value = item.price;
        option.textContent = `${item.name} (₹${item.price})`;
        mainSelect.appendChild(option);
    });

    // Add sides (fries, nuggets)
    [...menuData.fries, ...menuData.nuggets].forEach(item => {
        const option = document.createElement('option');
        option.value = item.price;
        option.textContent = `${item.name} (₹${item.price})`;
        sideSelect.appendChild(option);
    });

    // Add drinks (juices, mocktails)
    [...menuData.juices, ...menuData.mocktails].forEach(item => {
        const option = document.createElement('option');
        option.value = item.price;
        option.textContent = `${item.name} (₹${item.price})`;
        drinkSelect.appendChild(option);
    });
}

function calculateCombo() {
    const main = parseInt(document.getElementById('combo-main').value) || 0;
    const side = parseInt(document.getElementById('combo-side').value) || 0;
    const drink = parseInt(document.getElementById('combo-drink').value) || 0;

    const total = main + side + drink;
    const discount = Math.round(total * 0.15);
    const final = total - discount;

    document.getElementById('normal-price').textContent = `₹${total}`;
    document.getElementById('discount-price').textContent = `-₹${discount}`;
    document.getElementById('final-price').textContent = `₹${final}`;
}

function addComboToCart() {
    const main = parseInt(document.getElementById('combo-main').value);
    const side = parseInt(document.getElementById('combo-side').value);
    const drink = parseInt(document.getElementById('combo-drink').value);

    if (main === 0 || side === 0 || drink === 0) {
        alert('Please select all items');
        return;
    }

    const total = main + side + drink;
    const discount = Math.round(total * 0.15);
    const final = total - discount;

    addToCart(`Combo (Main+Side+Drink)`, final);
}

// Checkout
async function proceedToCheckout() {
    if (!currentUser) {
        alert('Please login to proceed');
        closeCart();
        openAuthModal();
        return;
    }

    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    const deliveryAddress = prompt('Enter your delivery address:');
    if (!deliveryAddress) return;

    const token = localStorage.getItem('token');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = 50;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryCharge + tax;

    const orderData = {
        items: cart,
        deliveryAddress: { street: deliveryAddress },
        paymentMethod: 'razorpay'
    };

    try {
        const orderResponse = await api.createOrder(orderData, token);
        currentOrder = orderResponse.order;

        // Create payment
        const paymentResponse = await api.createPayment(currentOrder._id, total, token);

        // Open Razorpay
        const options = {
            key: RAZORPAY_KEY,
            amount: total * 100,
            currency: 'INR',
            name: 'The Mefa Cafe India',
            description: 'Food Order Payment',
            order_id: paymentResponse.razorpayOrderId,
            handler: async (response) => {
                try {
                    const verifyResponse = await api.verifyPayment({
                        razorpayOrderId: paymentResponse.razorpayOrderId,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature
                    }, token);

                    if (verifyResponse.payment) {
                        alert('Payment successful! Your order has been placed.');
                        cart = [];
                        updateCart();
                        closeCart();
                        window.location.href = 'orders.html';
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    alert('Payment verification failed');
                }
            },
            prefill: {
                email: currentUser.email,
                contact: currentUser.phone
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
    }
}

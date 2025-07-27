// Load compounds from localStorage or use defaults
function loadCompoundsDatabase() {
    const stored = localStorage.getItem('researchHubCompounds');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Default compounds for demo
    return [
    // SARMs
    {
        id: 1,
        name: "Ostarine (MK-2866)",
        category: "sarms",
        description: "Mild SARM for muscle preservation and lean gains",
        sources: [
            { vendor: "Source A", price: 45.99, minOrder: 150, shipping: 15 },
            { vendor: "Source B", price: 49.99, minOrder: 200, shipping: 10 },
            { vendor: "Source C", price: 42.99, minOrder: 100, shipping: 20 }
        ],
        dosage: "10-25mg/day",
        cycle: "8-12 weeks"
    },
    {
        id: 2,
        name: "RAD-140 (Testolone)",
        category: "sarms",
        description: "Potent SARM for strength and muscle gains",
        sources: [
            { vendor: "Source A", price: 69.99, minOrder: 150, shipping: 15 },
            { vendor: "Source D", price: 64.99, minOrder: 150, shipping: 12 }
        ],
        dosage: "10-20mg/day",
        cycle: "8-10 weeks"
    },
    {
        id: 3,
        name: "LGD-4033 (Ligandrol)",
        category: "sarms",
        description: "Popular SARM for bulking cycles",
        sources: [
            { vendor: "Source B", price: 59.99, minOrder: 200, shipping: 10 },
            { vendor: "Source E", price: 54.99, minOrder: 175, shipping: 15 }
        ],
        dosage: "5-10mg/day",
        cycle: "8-10 weeks"
    },
    // Peptides
    {
        id: 4,
        name: "BPC-157",
        category: "peptides",
        description: "Healing peptide for injury recovery",
        sources: [
            { vendor: "Source F", price: 89.99, minOrder: 200, shipping: 20 },
            { vendor: "Source G", price: 94.99, minOrder: 150, shipping: 15 }
        ],
        dosage: "250-500mcg/day",
        cycle: "4-6 weeks"
    },
    {
        id: 5,
        name: "TB-500",
        category: "peptides",
        description: "Recovery and healing peptide",
        sources: [
            { vendor: "Source F", price: 119.99, minOrder: 200, shipping: 20 },
            { vendor: "Source H", price: 109.99, minOrder: 250, shipping: 10 }
        ],
        dosage: "2-5mg/week",
        cycle: "4-8 weeks"
    },
    // PCT
    {
        id: 6,
        name: "Nolvadex (Tamoxifen)",
        category: "pct",
        description: "SERM for post cycle therapy",
        sources: [
            { vendor: "Source I", price: 34.99, minOrder: 100, shipping: 15 },
            { vendor: "Source J", price: 39.99, minOrder: 150, shipping: 10 }
        ],
        dosage: "20-40mg/day",
        cycle: "4-6 weeks"
    },
    {
        id: 7,
        name: "Clomid (Clomiphene)",
        category: "pct",
        description: "SERM for PCT and testosterone recovery",
        sources: [
            { vendor: "Source I", price: 44.99, minOrder: 100, shipping: 15 },
            { vendor: "Source K", price: 49.99, minOrder: 200, shipping: 12 }
        ],
        dosage: "25-50mg/day",
        cycle: "4-6 weeks"
    },
    // Nootropics
    {
        id: 8,
        name: "Modafinil",
        category: "nootropics",
        description: "Wakefulness and focus enhancer",
        sources: [
            { vendor: "Source L", price: 79.99, minOrder: 150, shipping: 20 },
            { vendor: "Source M", price: 74.99, minOrder: 200, shipping: 15 }
        ],
        dosage: "100-200mg/day",
        cycle: "As needed"
    }
    ];
}

// Shopping cart
let cart = [];
let activeCategory = 'all';
let compounds = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    compounds = loadCompoundsDatabase();
    updateStats();
    displayCompounds(compounds);
    setupEventListeners();
});

// Update statistics
function updateStats() {
    const totalProducts = compounds.length;
    const uniqueVendors = new Set();
    compounds.forEach(c => c.sources.forEach(s => uniqueVendors.add(s.vendor)));
    
    // Update stat cards
    const statsHtml = `
        <div class="stat-card">
            <h3 class="text-gray-400 text-sm mb-2">Total Products</h3>
            <p class="text-4xl font-bold">${totalProducts}</p>
        </div>
        <div class="stat-card">
            <h3 class="text-gray-400 text-sm mb-2">Verified Sources</h3>
            <p class="text-4xl font-bold text-blue-500">${uniqueVendors.size}</p>
        </div>
        <div class="stat-card">
            <h3 class="text-gray-400 text-sm mb-2">Available Now</h3>
            <p class="text-4xl font-bold text-green-500">${totalProducts}</p>
        </div>
    `;
    
    document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3').innerHTML = statsHtml;
}

// Listen for updates from admin panel
window.addEventListener('message', (event) => {
    if (event.data.type === 'updateCompounds') {
        compounds = event.data.compounds;
        updateStats();
        displayCompounds(compounds);
    }
});

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = compounds.filter(compound => 
            compound.name.toLowerCase().includes(searchTerm) ||
            compound.description.toLowerCase().includes(searchTerm) ||
            compound.category.toLowerCase().includes(searchTerm)
        );
        displayCompounds(filtered);
    });

    // Category filters
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.category;
            filterByCategory();
        });
    });
}

function filterByCategory() {
    const filtered = activeCategory === 'all' 
        ? compounds 
        : compounds.filter(c => c.category === activeCategory);
    displayCompounds(filtered);
}

function displayCompounds(compoundsToShow) {
    const grid = document.getElementById('compoundGrid');
    grid.innerHTML = '';

    compoundsToShow.forEach(compound => {
        const card = createCompoundCard(compound);
        grid.appendChild(card);
    });
}

function createCompoundCard(compound) {
    const div = document.createElement('div');
    div.className = 'compound-card';
    
    const bestPrice = Math.min(...compound.sources.map(s => s.price));
    const bestSource = compound.sources.find(s => s.price === bestPrice);

    div.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">${compound.name}</h3>
        <p class="text-gray-400 text-sm mb-3">${compound.description}</p>
        
        <div class="mb-3">
            <span class="text-gray-500 text-sm">Dosage:</span>
            <span class="text-white ml-2">${compound.dosage}</span>
        </div>
        
        <div class="mb-3">
            <span class="text-gray-500 text-sm">Cycle:</span>
            <span class="text-white ml-2">${compound.cycle}</span>
        </div>
        
        <div class="mb-3">
            <span class="text-gray-500 text-sm">Best Price:</span>
            <div class="price-tag">$${bestPrice.toFixed(2)}</div>
            <span class="text-xs text-gray-400">from ${bestSource.vendor}</span>
        </div>
        
        <div class="mb-3">
            <span class="text-gray-500 text-sm">Available from:</span>
            <div class="mt-1">
                ${compound.sources.map(s => 
                    `<span class="source-badge">${s.vendor}</span>`
                ).join('')}
            </div>
        </div>
        
        <button 
            onclick="addToCart(${compound.id})" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
            <i class="fas fa-plus mr-2"></i>Add to Order
        </button>
    `;

    return div;
}

function addToCart(compoundId) {
    const compound = compounds.find(c => c.id === compoundId);
    if (!compound) return;

    // Check if already in cart
    const existingItem = cart.find(item => item.compound.id === compoundId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            compound: compound,
            quantity: 1,
            selectedSource: null
        });
    }

    updateOrderBuilder();
    document.getElementById('orderBuilder').style.display = 'block';
}

function updateOrderBuilder() {
    const container = document.getElementById('selectedItems');
    container.innerHTML = '';

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'selected-item';
        
        div.innerHTML = `
            <div class="flex-1">
                <h4 class="font-semibold">${item.compound.name}</h4>
                <div class="mt-2">
                    <select 
                        onchange="selectSource(${index}, this.value)" 
                        class="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm"
                    >
                        <option value="">Select Source</option>
                        ${item.compound.sources.map((s, i) => 
                            `<option value="${i}">
                                ${s.vendor} - $${s.price} (min: $${s.minOrder})
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="flex items-center gap-2 mt-2">
                    <button 
                        onclick="updateQuantity(${index}, -1)" 
                        class="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                    >-</button>
                    <span class="px-3">${item.quantity}</span>
                    <button 
                        onclick="updateQuantity(${index}, 1)" 
                        class="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                    >+</button>
                </div>
            </div>
            <button 
                onclick="removeFromCart(${index})" 
                class="text-red-500 hover:text-red-400"
            >
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(div);
    });

    calculateTotals();
}

function selectSource(cartIndex, sourceIndex) {
    if (sourceIndex === '') {
        cart[cartIndex].selectedSource = null;
    } else {
        cart[cartIndex].selectedSource = parseInt(sourceIndex);
    }
    calculateTotals();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        updateOrderBuilder();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateOrderBuilder();
    if (cart.length === 0) {
        document.getElementById('orderBuilder').style.display = 'none';
    }
}

function calculateTotals() {
    // Group items by vendor to optimize shipping
    const vendorGroups = {};
    let subtotal = 0;
    let hasUnselectedSources = false;

    cart.forEach(item => {
        if (item.selectedSource === null) {
            hasUnselectedSources = true;
            return;
        }

        const source = item.compound.sources[item.selectedSource];
        const vendor = source.vendor;
        
        if (!vendorGroups[vendor]) {
            vendorGroups[vendor] = {
                items: [],
                subtotal: 0,
                shipping: source.shipping,
                minOrder: source.minOrder
            };
        }

        const itemTotal = source.price * item.quantity;
        vendorGroups[vendor].items.push(item);
        vendorGroups[vendor].subtotal += itemTotal;
        subtotal += itemTotal;
    });

    // Calculate shipping
    let totalShipping = 0;
    Object.values(vendorGroups).forEach(group => {
        if (group.subtotal >= group.minOrder) {
            totalShipping += group.shipping;
        }
    });

    // Update UI
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${totalShipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${(subtotal + totalShipping).toFixed(2)}`;

    if (hasUnselectedSources) {
        document.getElementById('shipping').textContent = 'Select sources';
        document.getElementById('total').textContent = 'Select sources';
    }
}

function generateEmailTemplate() {
    // Validate all sources selected
    const unselected = cart.filter(item => item.selectedSource === null);
    if (unselected.length > 0) {
        alert('Please select a source for all items in your order');
        return;
    }

    // Group by vendor
    const vendorOrders = {};
    cart.forEach(item => {
        const source = item.compound.sources[item.selectedSource];
        const vendor = source.vendor;
        
        if (!vendorOrders[vendor]) {
            vendorOrders[vendor] = {
                items: [],
                subtotal: 0,
                shipping: source.shipping,
                minOrder: source.minOrder
            };
        }

        vendorOrders[vendor].items.push({
            name: item.compound.name,
            quantity: item.quantity,
            price: source.price,
            total: source.price * item.quantity
        });
        vendorOrders[vendor].subtotal += source.price * item.quantity;
    });

    // Generate email templates
    let emailContent = '';
    Object.entries(vendorOrders).forEach(([vendor, order]) => {
        emailContent += `--- Email for ${vendor} ---\n\n`;
        emailContent += `Subject: Research Order Inquiry\n\n`;
        emailContent += `Hello,\n\n`;
        emailContent += `I am interested in placing an order for research purposes. Here are the items I would like to purchase:\n\n`;
        
        order.items.forEach(item => {
            emailContent += `- ${item.name} x ${item.quantity} units @ $${item.price.toFixed(2)} each = $${item.total.toFixed(2)}\n`;
        });
        
        emailContent += `\nSubtotal: $${order.subtotal.toFixed(2)}\n`;
        emailContent += `Shipping: $${order.shipping.toFixed(2)}\n`;
        emailContent += `Total: $${(order.subtotal + order.shipping).toFixed(2)}\n\n`;
        
        emailContent += `Please confirm availability and provide payment instructions.\n\n`;
        emailContent += `Thank you,\n[Your Name]\n\n`;
        emailContent += `-------------------\n\n`;
    });

    document.getElementById('emailTemplate').textContent = emailContent;
    document.getElementById('emailTemplateContainer').style.display = 'block';
}

function copyEmailTemplate() {
    const emailText = document.getElementById('emailTemplate').textContent;
    navigator.clipboard.writeText(emailText).then(() => {
        alert('Email template copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
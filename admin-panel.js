// Admin panel functionality
let sourceFieldCount = 0;
let compoundsDatabase = [];

// Load existing data
function loadCompounds() {
    const stored = localStorage.getItem('researchHubCompounds');
    if (stored) {
        compoundsDatabase = JSON.parse(stored);
        displayCompounds();
    }
}

// Add source field to form
function addSourceField() {
    sourceFieldCount++;
    const container = document.getElementById('sourcesContainer');
    const sourceDiv = document.createElement('div');
    sourceDiv.className = 'source-item mb-2';
    sourceDiv.id = `source-${sourceFieldCount}`;
    
    sourceDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
            <input type="text" placeholder="Vendor Name" class="form-input source-vendor" required>
            <input type="number" step="0.01" placeholder="Price" class="form-input source-price" required>
            <input type="number" placeholder="Min Order ($)" class="form-input source-minorder" required>
            <input type="number" placeholder="Shipping ($)" class="form-input source-shipping" required>
        </div>
        <button type="button" onclick="removeSourceField('source-${sourceFieldCount}')" class="text-red-500 hover:text-red-400 ml-2">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    container.appendChild(sourceDiv);
}

// Remove source field
function removeSourceField(id) {
    document.getElementById(id).remove();
}

// Handle form submission
document.getElementById('compoundForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect sources
    const sources = [];
    document.querySelectorAll('.source-item').forEach(item => {
        const vendor = item.querySelector('.source-vendor').value;
        const price = parseFloat(item.querySelector('.source-price').value);
        const minOrder = parseInt(item.querySelector('.source-minorder').value);
        const shipping = parseInt(item.querySelector('.source-shipping').value);
        
        if (vendor && price && minOrder && shipping) {
            sources.push({ vendor, price, minOrder, shipping });
        }
    });
    
    if (sources.length === 0) {
        alert('Please add at least one source');
        return;
    }
    
    // Create compound object
    const compound = {
        id: Date.now(),
        name: document.getElementById('compoundName').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        dosage: document.getElementById('dosage').value,
        cycle: document.getElementById('cycle').value,
        sources: sources
    };
    
    // Add to database
    compoundsDatabase.push(compound);
    saveCompounds();
    
    // Reset form
    document.getElementById('compoundForm').reset();
    document.getElementById('sourcesContainer').innerHTML = '';
    sourceFieldCount = 0;
    
    // Refresh display
    displayCompounds();
    
    alert('Compound added successfully!');
});

// Save compounds to localStorage
function saveCompounds() {
    localStorage.setItem('researchHubCompounds', JSON.stringify(compoundsDatabase));
    
    // Also update the main research hub
    if (window.opener) {
        window.opener.postMessage({ type: 'updateCompounds', compounds: compoundsDatabase }, '*');
    }
}

// Display current compounds
function displayCompounds() {
    const container = document.getElementById('compoundsList');
    container.innerHTML = '';
    
    compoundsDatabase.forEach(compound => {
        const div = document.createElement('div');
        div.className = 'bg-gray-900 rounded-lg p-4 mb-4';
        
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-2">${compound.name}</h3>
                    <p class="text-gray-400 text-sm mb-2">${compound.description}</p>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><span class="text-gray-500">Category:</span> ${compound.category}</div>
                        <div><span class="text-gray-500">Dosage:</span> ${compound.dosage}</div>
                        <div><span class="text-gray-500">Cycle:</span> ${compound.cycle}</div>
                        <div><span class="text-gray-500">Sources:</span> ${compound.sources.length}</div>
                    </div>
                    <div class="mt-2">
                        ${compound.sources.map(s => 
                            `<span class="inline-block bg-blue-900 bg-opacity-50 px-2 py-1 rounded text-xs mr-1 mb-1">
                                ${s.vendor}: $${s.price}
                            </span>`
                        ).join('')}
                    </div>
                </div>
                <button onclick="deleteCompound(${compound.id})" class="text-red-500 hover:text-red-400 ml-4">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(div);
    });
}

// Delete compound
function deleteCompound(id) {
    if (confirm('Are you sure you want to delete this compound?')) {
        compoundsDatabase = compoundsDatabase.filter(c => c.id !== id);
        saveCompounds();
        displayCompounds();
    }
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(compoundsDatabase, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `research-hub-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import data
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                compoundsDatabase = imported;
                saveCompounds();
                displayCompounds();
                alert('Data imported successfully!');
            } else {
                alert('Invalid data format');
            }
        } catch (err) {
            alert('Error importing data: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// Parse pasted data
function parseData() {
    const input = document.getElementById('parseInput').value;
    if (!input) return;
    
    // This is a simple parser - you can enhance it based on common formats
    const lines = input.split('\n');
    const parsed = [];
    
    lines.forEach(line => {
        // Look for patterns like "Product Name - $XX.XX"
        const match = line.match(/(.+?)\s*[-–]\s*\$?([\d.]+)/);
        if (match) {
            parsed.push({
                name: match[1].trim(),
                price: parseFloat(match[2])
            });
        }
    });
    
    if (parsed.length > 0) {
        alert(`Found ${parsed.length} items. Please complete the form for each one.`);
        // You could auto-fill the form with the first item
        if (parsed[0]) {
            document.getElementById('compoundName').value = parsed[0].name;
            addSourceField();
            // Auto-fill the price in the first source field
            setTimeout(() => {
                document.querySelector('.source-price').value = parsed[0].price;
            }, 100);
        }
    } else {
        alert('Could not parse any data. Try a different format.');
    }
    
    document.getElementById('parseInput').value = '';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadCompounds);

// Add at least one source field by default
addSourceField();
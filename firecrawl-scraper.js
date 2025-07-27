// Firecrawl API integration for research data collection
// Requires Firecrawl API key from https://firecrawl.com

class FirecrawlScraper {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.firecrawl.dev/v0';
    }

    async scrapePage(url) {
        try {
            const response = await fetch(`${this.baseUrl}/scrape`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    pageOptions: {
                        waitForSelector: '.message-content', // Forum post content
                        screenshot: false,
                        fullPageScreenshot: false
                    },
                    extractorOptions: {
                        mode: 'llm-extraction',
                        extractionPrompt: `Extract all product/compound information including:
                        - Product names
                        - Prices (in USD)
                        - Dosages/concentrations
                        - Categories (oral, injectable, etc)
                        - Any minimum order requirements
                        - Shipping information
                        Format as structured JSON array.`,
                        extractionSchema: {
                            type: 'object',
                            properties: {
                                products: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            price: { type: 'number' },
                                            category: { type: 'string' },
                                            dosage: { type: 'string' },
                                            minOrder: { type: 'number' },
                                            notes: { type: 'string' }
                                        }
                                    }
                                },
                                vendorInfo: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        minOrderAmount: { type: 'number' },
                                        shippingCost: { type: 'number' },
                                        acceptedPayments: { type: 'array' }
                                    }
                                }
                            }
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Firecrawl API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseScrapedData(data);

        } catch (error) {
            console.error('Firecrawl scraping error:', error);
            throw error;
        }
    }

    parseScrapedData(data) {
        if (!data.data || !data.data.llm_extraction) {
            throw new Error('No extraction data found');
        }

        const extracted = data.data.llm_extraction;
        const compounds = [];

        // Get vendor info
        const vendorName = extracted.vendorInfo?.name || 'Unknown Vendor';
        const defaultShipping = extracted.vendorInfo?.shippingCost || 15;
        const defaultMinOrder = extracted.vendorInfo?.minOrderAmount || 150;

        // Process products
        if (extracted.products && Array.isArray(extracted.products)) {
            extracted.products.forEach(product => {
                // Determine category
                let category = 'other';
                const name = product.name.toLowerCase();
                
                if (name.includes('sarm') || name.includes('mk-') || name.includes('rad-') || name.includes('lgd-')) {
                    category = 'sarms';
                } else if (name.includes('peptide') || name.includes('bpc') || name.includes('tb-')) {
                    category = 'peptides';
                } else if (name.includes('pct') || name.includes('nolva') || name.includes('clomid')) {
                    category = 'pct';
                } else if (name.includes('test') || name.includes('tren') || name.includes('deca') || name.includes('mast')) {
                    category = 'steroids';
                }

                const compound = {
                    id: Date.now() + Math.random(),
                    name: product.name,
                    category: category,
                    description: product.notes || `Research compound from ${vendorName}`,
                    dosage: product.dosage || 'See vendor guidelines',
                    cycle: 'Consult research protocols',
                    sources: [{
                        vendor: vendorName,
                        price: product.price || 0,
                        minOrder: product.minOrder || defaultMinOrder,
                        shipping: defaultShipping
                    }]
                };

                compounds.push(compound);
            });
        }

        return {
            compounds: compounds,
            vendorInfo: extracted.vendorInfo,
            sourceUrl: data.sourceUrl || '',
            scrapedAt: new Date().toISOString()
        };
    }

    async scrapeMultiplePages(urls) {
        const results = [];
        
        for (const url of urls) {
            try {
                console.log(`Scraping: ${url}`);
                const data = await this.scrapePage(url);
                results.push(data);
                
                // Rate limiting - wait 2 seconds between requests
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Failed to scrape ${url}:`, error);
            }
        }

        return results;
    }
}

// Integration with admin panel
async function scrapeWithFirecrawl(url, apiKey) {
    if (!apiKey) {
        alert('Please enter your Firecrawl API key first');
        return;
    }

    const scraper = new FirecrawlScraper(apiKey);
    
    try {
        showLoading(true);
        const result = await scraper.scrapePage(url);
        
        // Add compounds to the system
        if (result.compounds && result.compounds.length > 0) {
            const existingCompounds = JSON.parse(localStorage.getItem('researchHubCompounds') || '[]');
            const updatedCompounds = [...existingCompounds, ...result.compounds];
            localStorage.setItem('researchHubCompounds', JSON.stringify(updatedCompounds));
            
            alert(`Successfully imported ${result.compounds.length} compounds from ${result.vendorInfo?.name || 'vendor'}`);
            
            // Reload the display
            if (typeof displayCompounds === 'function') {
                displayCompounds();
            }
        } else {
            alert('No compounds found on this page');
        }
        
    } catch (error) {
        alert(`Scraping failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    // Toggle loading indicator
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// Export for use in admin panel
window.FirecrawlScraper = FirecrawlScraper;
window.scrapeWithFirecrawl = scrapeWithFirecrawl;
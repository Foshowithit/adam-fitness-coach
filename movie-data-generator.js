// Movie prop data generator for fictional compounds
// For entertainment/movie production purposes only

function generateMovieCompounds() {
    // Fictional vendor names for the movie
    const movieVendors = [
        "Hypertrophy Labs", "Alpha Research", "Phoenix Pharma", "Titan Sciences",
        "Olympus Biotech", "Spartan Research", "Atlas Compounds", "Viper Flex Labs",
        "Dragon Pharma", "Nordic Research", "Zeus Laboratories", "Apollo Sciences",
        "Hercules Biotech"
    ];

    // Generate realistic-looking movie prop compounds
    const movieCompounds = [
        // Fictional SARMs for the movie
        {
            id: 100,
            name: "Hypertrophy Test Base (Movie Prop)",
            category: "steroids",
            description: "Fictional testosterone base for film production",
            dosage: "250-500mg/week",
            cycle: "12-16 weeks",
            sources: [
                { vendor: "Hypertrophy Labs", price: 55.00, minOrder: 150, shipping: 15 },
                { vendor: "Viper Flex Labs", price: 59.99, minOrder: 200, shipping: 10 }
            ]
        },
        {
            id: 101,
            name: "Deca-Max 300 (Prop Version)",
            category: "steroids", 
            description: "Movie prop nandrolone compound",
            dosage: "300-600mg/week",
            cycle: "12-16 weeks",
            sources: [
                { vendor: "Hypertrophy Labs", price: 65.00, minOrder: 150, shipping: 15 },
                { vendor: "Phoenix Pharma", price: 69.99, minOrder: 175, shipping: 12 }
            ]
        },
        {
            id: 102,
            name: "Anavar-Film 50",
            category: "steroids",
            description: "Prop oxandrolone for movie scenes",
            dosage: "50-100mg/day",
            cycle: "6-8 weeks",
            sources: [
                { vendor: "Hypertrophy Labs", price: 89.99, minOrder: 150, shipping: 15 },
                { vendor: "Titan Sciences", price: 94.99, minOrder: 200, shipping: 10 }
            ]
        },
        {
            id: 103,
            name: "Primo-Scene 200",
            category: "steroids",
            description: "Fictional primobolan for film",
            dosage: "400-600mg/week", 
            cycle: "12-16 weeks",
            sources: [
                { vendor: "Hypertrophy Labs", price: 120.00, minOrder: 150, shipping: 15 },
                { vendor: "Olympus Biotech", price: 115.00, minOrder: 250, shipping: 8 }
            ]
        },
        {
            id: 104,
            name: "Masteron-Prop 100",
            category: "steroids",
            description: "Movie prop drostanolone",
            dosage: "300-500mg/week",
            cycle: "8-10 weeks",
            sources: [
                { vendor: "Hypertrophy Labs", price: 75.00, minOrder: 150, shipping: 15 },
                { vendor: "Spartan Research", price: 79.99, minOrder: 200, shipping: 12 }
            ]
        },
        {
            id: 105,
            name: "EQ-Cinema 300",
            category: "steroids",
            description: "Prop boldenone for movie production",
            dosage: "400-800mg/week",
            cycle: "14-16 weeks",
            sources: [
                { vendor: "Hypertrophy Labs", price: 59.99, minOrder: 150, shipping: 15 },
                { vendor: "Atlas Compounds", price: 64.99, minOrder: 175, shipping: 13 }
            ]
        },
        {
            id: 106,
            name: "Tren-Movie Ace",
            category: "steroids",
            description: "Fictional trenbolone acetate",
            dosage: "200-400mg/week",
            cycle: "8-10 weeks", 
            sources: [
                { vendor: "Hypertrophy Labs", price: 85.00, minOrder: 150, shipping: 15 },
                { vendor: "Dragon Pharma", price: 89.99, minOrder: 200, shipping: 10 }
            ]
        },
        {
            id: 107,
            name: "Winstrol-Stage 50",
            category: "steroids",
            description: "Prop stanozolol for film",
            dosage: "50mg/day",
            cycle: "6-8 weeks",
            sources: [
                { vendor: "Hypertrophy Labs", price: 69.99, minOrder: 150, shipping: 15 },
                { vendor: "Nordic Research", price: 74.99, minOrder: 180, shipping: 11 }
            ]
        },
        {
            id: 108,
            name: "HGH-Cinema Blue",
            category: "peptides",
            description: "Movie prop growth hormone",
            dosage: "2-4 IU/day",
            cycle: "6 months",
            sources: [
                { vendor: "Hypertrophy Labs", price: 250.00, minOrder: 150, shipping: 15 },
                { vendor: "Zeus Laboratories", price: 240.00, minOrder: 300, shipping: 0 }
            ]
        },
        {
            id: 109,
            name: "Aromasin-Film 25",
            category: "pct",
            description: "Prop AI for movie scenes",
            dosage: "12.5-25mg/day",
            cycle: "As needed",
            sources: [
                { vendor: "Hypertrophy Labs", price: 54.99, minOrder: 150, shipping: 15 },
                { vendor: "Apollo Sciences", price: 59.99, minOrder: 100, shipping: 18 }
            ]
        },
        {
            id: 110,
            name: "Cialis-Scene 20",
            category: "other",
            description: "Movie prop tadalafil",
            dosage: "10-20mg/day",
            cycle: "As needed",
            sources: [
                { vendor: "Hypertrophy Labs", price: 39.99, minOrder: 150, shipping: 15 },
                { vendor: "Hercules Biotech", price: 44.99, minOrder: 125, shipping: 17 }
            ]
        }
    ];

    return movieCompounds;
}

// Add movie compounds to the research hub
function loadMovieData() {
    const movieCompounds = generateMovieCompounds();
    
    // Get existing compounds
    let existingCompounds = [];
    const stored = localStorage.getItem('researchHubCompounds');
    if (stored) {
        existingCompounds = JSON.parse(stored);
    }
    
    // Merge with movie compounds
    const allCompounds = [...existingCompounds, ...movieCompounds];
    
    // Save to localStorage
    localStorage.setItem('researchHubCompounds', JSON.stringify(allCompounds));
    
    console.log(`Added ${movieCompounds.length} movie prop compounds for film production`);
    alert(`Successfully added ${movieCompounds.length} fictional compounds for your movie!`);
}

// Automatically load movie data when this script runs
loadMovieData();
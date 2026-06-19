// EnergyFM Visual Analytics Carousel functionality
document.addEventListener('DOMContentLoaded', function () {
    // Array holding the metadata and paths for your analytics plots.
    // Place the corresponding image files inside website/img/plots/
    const analyticsPlots = [
        {
            name: "EnergyBench: Commercial vs Residential Load Profiles",
            file: "load_profile_comparison",
            ext: "png"
        },
        {
            name: "EnergyFM: Forecasting Error Distribution (OOD vs ID)",
            file: "forecast_error_distribution",
            ext: "png"
        },
        {
            name: "Energy-TSPulse: Anomaly Detection Score Heatmap",
            file: "anomaly_score_heatmap",
            ext: "png"
        },
        {
            name: "Energy-TSPulse: Appliance Classification Confusion Matrix",
            file: "classification_confusion_matrix",
            ext: "png"
        }
    ];

    // Initialize the analytics carousel (matches id="analytics-carousel-box" in new_index.html)
    initCarousel('analytics-carousel-box', analyticsPlots);
});

function initCarousel(carouselId, cases) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    const imageContainer = carousel.querySelector('.case-image-container');
    const title = carousel.querySelector('.case-title');
    const prevBtn = carousel.querySelector('.prev-case');
    const nextBtn = carousel.querySelector('.next-case');
    const counter = carousel.querySelector('.case-counter');
    let currentIndex = 0;

    function updateCase() {
        const currentCase = cases[currentIndex];

        // Dynamically matches the image extension for each plot asset
        imageContainer.innerHTML = `
            <img src="website/img/plots/${currentCase.file}.${currentCase.ext}"
                 alt="${currentCase.name}"
                 class="case-image"
                 style="max-width: 95%; max-height: 550px; object-fit: contain;">
        `;

        title.textContent = currentCase.name;
        counter.textContent = `${currentIndex + 1} / ${cases.length}`;

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === cases.length - 1;
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCase();
        }
    });
    nextBtn.addEventListener('click', () => {
        if (currentIndex < cases.length - 1) {
            currentIndex++;
            updateCase();
        }
    });

    document.addEventListener('keydown', (e) => {
        const rect = carousel.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                updateCase();
            } else if (e.key === 'ArrowRight' && currentIndex < cases.length - 1) {
                currentIndex++;
                updateCase();
            }
        }
    });

    updateCase();
}
// Initialize the Leaflet map
var map = L.map('map').setView([54.5260, 15.2551], 4);

// Add a base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Colors for the graduated map
const colorRamp = [
    '#FFEDA0',
    '#FED976',
    '#FEB24C',
    '#FD8D3C',
    '#FC4E2A',
    '#E31A1C',
    '#BD0026',
    '#800026'
];

let breaks = [];
let minValue = null;
let maxValue = null;

function getGraduatedColor(value) {
    if (breaks.length === 0) return colorRamp[0];
    for (let i = breaks.length - 1; i >= 0; i--) {
        if (value >= breaks[i]) {
            return colorRamp[i];
        }
    }
    return colorRamp[0];
}

function style(feature) {
    const value = parseFloat(feature.properties.eco_co2_per_capita);
    return {
        fillColor: getGraduatedColor(value),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Fetch the GeoJSON data
fetch('./merged.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Compute min and max eco_co2_per_capita
        let values = data.features
            .map(f => parseFloat(f.properties.eco_co2_per_capita))
            .filter(v => !isNaN(v));
        minValue = Math.min(...values);
        maxValue = Math.max(...values);

        // Compute breaks for the color ramp
        breaks = [];
        for (let i = 0; i < colorRamp.length; i++) {
            breaks.push(minValue + (i * (maxValue - minValue) / (colorRamp.length - 1)));
        }

        L.geoJSON(data, {
            style: style,
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || feature.properties.country || '';
                const co2 = feature.properties.eco_co2_per_capita;
                if (name && co2 !== undefined && co2 !== null) {
                    layer.bindPopup(`<b>${name}</b><br>eco_co2_per_capita: ${co2}`);
                }
            }
        }).addTo(map);

        // Add legend
        addLegend();
    })
    .catch(error => {
        console.error('Error fetching GeoJSON data:', error);
        alert('Error loading map data. Please make sure merged.geojson file exists and the page is served from a web server.');
    });

function addLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'legend');
        let html = '<span class="legend-title">eco_co2_per_capita (color code)</span><br>';
        for (let i = 0; i < breaks.length; i++) {
            let from = breaks[i];
            let to = breaks[i + 1];
            html +=
                '<span class="legend-color" style="background:' + colorRamp[i] + '"></span>' +
                '<span class="legend-label">' + from.toFixed(2) + (to ? ' &ndash; ' + to.toFixed(2) : '+') +
                ' (' + colorRamp[i] + ')' +
                '</span><br>';
        }
        div.innerHTML = html;
        return div;
    };
    legend.addTo(map);
}
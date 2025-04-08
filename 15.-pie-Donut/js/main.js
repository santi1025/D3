// Configuración general
const margin = { top: 20, right: 300, bottom: 30, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const radius = Math.min(width, height) / 2;

// SVG y grupo principal
const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Escala de color
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Generador de arco (donut)
const arc = d3.arc()
    .innerRadius(radius * 0.4)
    .outerRadius(radius * 0.8);

// Generador de layout tipo pie
const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

// Carga y transformación de datos
d3.tsv("data/donut2.tsv").then(data => {
    data.forEach(d => {
        d.count = +d.count;
        d.fruit = d.fruit.toLowerCase();
    });

    const regionsByFruit = d3.nest()
        .key(d => d.fruit)
        .entries(data);

    // Crear radio buttons por fruta
    const label = d3.select("form").selectAll("label")
        .data(regionsByFruit)
        .enter().append("label");

    label.append("input")
        .attr("type", "radio")
        .attr("name", "fruit")
        .attr("value", d => d.key)
        .on("change", update)
        .filter((d, i) => i === 0)
        .each(update)
        .property("checked", true);

    label.append("span")
        .text(d => d.key);

}).catch(error => {
    console.error("Error al cargar datos:", error);
});

// Función de actualización (interacción)
function update(region) {
    let path = g.selectAll("path");

    const data0 = path.data();
    const data1 = pie(region.values);

    // JOIN
    path = path.data(data1, key);

    // EXIT
    path.exit()
        .datum((d, i) => findNeighborArc(i, data1, data0, key) || d)
        .transition()
        .duration(750)
        .attrTween("d", arcTween)
        .remove();

    // UPDATE
    path.transition()
        .duration(750)
        .attrTween("d", arcTween);

    // ENTER
    path.enter().append("path")
        .each((d, i) => {
            this._current = findNeighborArc(i, data0, data1, key) || d;
        })
        .attr("fill", d => color(d.data.region))
        .transition()
        .duration(750)
        .attrTween("d", arcTween);
}

// Función clave para identificar regiones
function key(d) {
    return d.data.region;
}

// Ayudantes para interpolaciones suaves (transiciones)
function findNeighborArc(i, data0, data1, key) {
    return findPreceding(i, data0, data1, key) 
        || findFollowing(i, data0, data1, key) 
        || null;
}

function findPreceding(i, data0, data1, key) {
    while (--i >= 0) {
        const k = key(data1[i]);
        const match = data0.find(d => key(d) === k);
        if (match) return match;
    }
}

function findFollowing(i, data0, data1, key) {
    while (++i < data1.length) {
        const k = key(data1[i]);
        const match = data0.find(d => key(d) === k);
        if (match) return match;
    }
}

// Interpolador de arco
function arcTween(d) {
    const i = d3.interpolate(this._current, d);
    this._current = i(1);
    return t => arc(i(t));
}

// Configuración de márgenes y dimensiones
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Crear SVG y grupo principal
const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parser de fechas
const parseTime = d3.timeParse("%d-%b-%y");

// Escalas
const x = d3.scaleTime().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([height, 0]);

// Generadores de ejes
const xAxisCall = d3.axisBottom();
const yAxisCall = d3.axisLeft();

// Generador de área
const area = d3.area()
    .x(d => x(d.date))
    .y0(height)
    .y1(d => y(d.close));

// Grupos de ejes
const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`);

const yAxis = g.append("g")
    .attr("class", "y axis");

// Etiqueta del eje Y
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#ffffff")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Price ($)");

// Cargar y procesar datos
d3.tsv("data/area.tsv").then(data => {
    data.forEach(d => {
        d.date = parseTime(d.date);
        d.close = +d.close;
    });

    // Dominios de escala
    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => d.close)]);

    // Dibujar ejes
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // Dibujar el área
    g.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("fill", "lightgreen")
        .attr("opacity", 0.7)
        .attr("d", area);

}).catch(error => {
    console.error("Error al cargar los datos:", error);
});

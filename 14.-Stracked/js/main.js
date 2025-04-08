// Configuración del lienzo y márgenes
const margin = { top: 20, right: 300, bottom: 30, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// SVG y grupo principal
const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parsers y formatos
const parseDate = d3.timeParse('%Y');
const formatNumber = d3.format(".1f");
const formatBillion = x => formatNumber(x / 1e9);

// Escalas
const x = d3.scaleTime().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([height, 0]);
const color = d3.scaleOrdinal(d3.schemeSpectral[11]);

// Ejes
const xAxisCall = d3.axisBottom();
const yAxisCall = d3.axisLeft().tickFormat(formatBillion);

// Generador de área apilada
const area = d3.area()
    .x(d => x(d.data.date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

// Stack generator
const stack = d3.stack();

// Grupos para ejes
const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`);

const yAxis = g.append("g")
    .attr("class", "y axis");

// Etiqueta eje Y
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Billions of liters");

// Grupo para leyenda
const legend = g.append("g")
    .attr("transform", `translate(${width + 150}, ${height - 210})`);

// Carga y procesamiento de datos
d3.csv('data/stacked_area2.csv').then(data => {

    // Extraer claves (columnas) excepto 'date'
    color.domain(d3.keys(data[0]).filter(key => key !== 'date'));
    const keys = color.domain();

    // Parseo y limpieza
    data.forEach(d => {
        d.date = parseDate(d.date);
    });

    // Valor máximo acumulado por fila
    const maxDateVal = d3.max(data, d => {
        const values = keys.map(key => +d[key] || 0);
        return d3.sum(values);
    });

    // Establecer dominios de escalas
    x.domain(d3.extent(data, d => d.date));
    y.domain([0, maxDateVal]);

    // Dibujar ejes
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // Configurar el stack generator
    stack.keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    // Dibujar áreas apiladas
    const layer = g.selectAll(".browser")
        .data(stack(data))
        .enter().append("g")
        .attr("class", "browser")
        .attr("fill", d => color(d.key));

    layer.append("path")
        .attr("class", "area")
        .attr("d", area);

    // Crear leyenda
    const legendKeys = keys.slice().reverse();

    const legendGroup = legend.selectAll(".legendGroup")
        .data(legendKeys)
        .enter().append("g")
        .attr("class", "legendGroup")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendGroup.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => color(d));

    legendGroup.append("text")
        .text(d => d)
        .style("font-size", 12)
        .attr("y", 10)
        .attr("x", 15);

}).catch(error => {
    console.error("Error al cargar los datos:", error);
});

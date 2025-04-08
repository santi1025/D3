// Datos para el gráfico
const data = [25, 20, 15, 10, 5];

// Dimensiones del SVG
const svgWidth = 400;
const svgHeight = 400;
const barWidth = 40;
const barSpacing = 10;
const marginLeft = 50;

// Crear el SVG dentro del contenedor con id #chart-area
const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Enlazar los datos y crear los rectángulos
svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, i) => marginLeft + i * (barWidth + barSpacing))
    .attr("y", d => svgHeight - d * 10)
    .attr("width", barWidth)
    .attr("height", d => d * 10)
    .attr("fill", "steelblue");

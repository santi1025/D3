// Setup de márgenes y dimensiones
const margin = { left: 80, right: 100, top: 50, bottom: 100 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// SVG y grupo principal
const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parsers y helpers
const parseTime = d3.timeParse("%Y");
const bisectDate = d3.bisector(d => d.year).left;

// Escalas
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Ejes
const xAxisCall = d3.axisBottom();
const yAxisCall = d3.axisLeft()
    .ticks(4)
    .tickFormat(d => `${parseInt(d / 1000)}k`);

// Grupos de ejes
const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`);

const yAxis = g.append("g")
    .attr("class", "y axis");

// Etiqueta eje Y
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Population");

// Generador de línea
const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value));

// Carga y renderizado de datos
d3.json("data/example.json").then(data => {
    // Limpieza
    data.forEach(d => {
        d.year = parseTime(d.year);
        d.value = +d.value;
    });

    // Dominio de escalas
    x.domain(d3.extent(data, d => d.year));
    y.domain([d3.min(data, d => d.value), d3.max(data, d => d.value)]);

    // Renderizado de ejes
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // Dibujo de línea
    g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line(data));

    // Tooltip interactivo
    const focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => focus.style("display", "none"))
        .on("mousemove", function () {
            const x0 = x.invert(d3.mouse(this)[0]);
            const i = bisectDate(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const d = x0 - d0.year > d1.year - x0 ? d1 : d0;

            focus.attr("transform", `translate(${x(d.year)}, ${y(d.value)})`);
            focus.select("text").text(d.value);
            focus.select(".x-hover-line").attr("y2", height - y(d.value));
            focus.select(".y-hover-line").attr("x2", -x(d.year));
        });
});

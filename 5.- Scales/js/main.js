d3.json("data/buildings.json").then((data) => {
    // Procesamiento de los datos
    data.forEach((d) => {
        d.name = d.name;
        d.height = +d.height; // Convertimos a número por si viene como string
    });

    console.log(data);

    // Crear SVG
    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", 500)
        .attr("height", 500);

    // Escalas
    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, 400])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.height)])
        .range([400, 0]);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.schemeSet3); // Paleta colorida

    // Dibujar las barras
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.height))
        .attr("width", x.bandwidth())
        .attr("height", d => 400 - y(d.height))
        .attr("fill", d => color(d.name)); // AQUÍ se corrige: ahora retorna color
}).catch((error) => {
    console.error("Error cargando el JSON:", error);
});

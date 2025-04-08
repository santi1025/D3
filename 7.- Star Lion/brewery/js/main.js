d3.json("data/revenues.json").then((data) => {
    data.forEach((d) => {
        d.month = d.month;
        d.revenue = +d.revenue; // Asegurarse que sea número
    });

    var margin = {top: 10, right: 10, bottom: 100, left: 100};
    var width = 600;
    var height = 400;

    var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "black"); // Fondo negro del SVG

    var g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const x = d3.scaleBand()
        .domain(data.map(d => d.month))  
        .range([0, width]) 
        .paddingInner(0.3)
        .paddingOuter(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.revenue)])  
        .range([height, 0]);

    // Escala de color (puedes mantenerla si quieres múltiples colores)
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.month)) 
        .range(d3.schemeSet3);
    
    // Crear barras
    g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.month))  
        .attr("y", d => y(d.revenue))  
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.revenue))  
        .attr("fill", "yellow"); // Barras amarillas (puedes usar color(d.month) si prefieres variedad)
    
    // Eje X (barra dorada)
    var xAxis = d3.axisBottom(x);
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("fill", "gold"); // Color dorado para las etiquetas

    g.select("g").selectAll("path, line")
        .attr("stroke", "gold"); // Ejes del eje X en dorado
    
    // Eje Y
    var yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(d => "$" + d);  
    g.append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("fill", "white"); // Texto blanco para contraste

    g.selectAll("g").selectAll("path, line")
        .attr("stroke", "white"); // Líneas del eje Y en blanco

    // Etiqueta del eje X
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .attr("fill", "gold")
        .attr("font-size", "14px")
        .text("Month");

    // Etiqueta del eje Y
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("fill", "gold")
        .attr("font-size", "14px")
        .text("Revenue (dlls.)");

}).catch((error) => {
    console.log(error);
});

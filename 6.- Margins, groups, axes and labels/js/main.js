d3.json("data/buildings.json").then((data) => {
    data.forEach((d) => {
        d.name = d.name;
        d.height = +d.height; // Asegura que sea número
    });

    var margin = {top: 10, right: 10, bottom: 100, left: 100};
    var width = 600;
    var height = 400;

    var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);
    
    var g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width]) 
        .paddingInner(0.3)
        .paddingOuter(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.height)])
        .range([height, 0]);
    
    var rect = g.selectAll("rect")
        .data(data);
    
    rect.enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.height))  
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.height))  
        .attr("fill", "#003f87");  
    
    var xAxis = d3.axisBottom(x);
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end");
    
    var yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => d + "m");
    g.append("g")
        .call(yAxis);
    
    g.append("text")
        .attr("x", width / 3)
        .attr("y", height + 95)
        .attr("text-anchor", "middle")
        .text("The world's tallest buildings");
    
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("Height (m)");

}).catch((error) => {
    console.log(error);
});

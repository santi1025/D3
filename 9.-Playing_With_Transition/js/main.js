// GRAPHIC'S SIZE
var margin = { top: 50, right: 10, bottom: 100, left: 100 };
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// CREATE SVG
var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// SCALES
var x = d3.scaleBand().range([0, width]).padding(0.2);
var y = d3.scaleLinear().range([height, 0]);

// AXES
var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

var yAxisGroup = g.append("g")
    .attr("class", "y axis");

// TAGS
g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "white") // texto blanco
    .text("Month");

var yLabel = g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "white") // texto blanco
    .text("Revenue ($)");

var showRevenue = true;

// UPLOAD AND UPDATE DATA EVERY SECOND
d3.json("data/revenues.json").then((data) => {
    data.forEach(d => {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(() => {
        showRevenue = !showRevenue; // CHANGE BETWEEN REVENUE AND PROFIT
        update(data);
    }, 2500);

    update(data);
}).catch(error => console.log(error));

function update(data) {
    var value = showRevenue ? "revenue" : "profit";

    // Filtrar datos si es profit
    var filteredData = showRevenue ? data : data.filter(d => d.month !== "January");

    // UPDATE SCALE DOMAINS
    x.domain(filteredData.map(d => d.month));
    y.domain([0, d3.max(filteredData, d => d[value])]);

    // UPDATE AXES
    xAxisGroup.transition().duration(2500).call(d3.axisBottom(x));
    yAxisGroup.transition().duration(2500).call(d3.axisLeft(y).ticks(10));

    // Cambiar color del texto de los ejes a blanco
    xAxisGroup.selectAll("text").attr("fill", "white");
    yAxisGroup.selectAll("text").attr("fill", "white");

    // Cambiar color de las líneas del eje (opcional)
    xAxisGroup.selectAll("path,line").attr("stroke", "white");
    yAxisGroup.selectAll("path,line").attr("stroke", "white");

    // UPDATE Y-AXIS LABEL
    yLabel.text(showRevenue ? "REVENUE ($)" : "PROFIT ($)");

    // BIND DATA TO BARS
    // BIND DATA TO BARS
var bars = g.selectAll("rect").data(filteredData, d => d.month);

// REMOVE UNUSED BARS
bars.exit()
    .transition().duration(1000)
    .attr("height", 0)
    .attr("y", y(0))
    .remove();

// UPDATE & ADD BARS
bars.enter().append("rect")
    .merge(bars)
    .transition().duration(2500)
    .attr("x", d => x(d.month))
    .attr("y", d => y(d[value]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d[value]))
    .attr("fill", "yellow");  // <-- color fijo amarillo
}

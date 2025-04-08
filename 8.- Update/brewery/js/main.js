var margin = {top: 10, right: 10, bottom: 100, left: 100};
var width = 600;
var height = 400;

var flag = true;

var svg = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

// Fondo negro
svg.append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("fill", "black");

// Grupo principal
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var x = d3.scaleBand().range([0, width]).padding(0.2);
var y = d3.scaleLinear().range([height, 0]);

var xAxisCall = d3.axisBottom(x);
var yAxisCall = d3.axisLeft(y);

var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")");

var yAxisGroup = g.append("g")
    .attr("class", "y-axis");

var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("fill", "white") // texto blanco
    .attr("transform", "rotate(-90)")
    .text("Revenue");

d3.json("data/revenues.json").then((data) => {
    data.forEach((d) => {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(() => {
        update(data);
        flag = !flag;
    }, 1000);

    update(data);

}).catch((error) => {
    console.log(error);
});

function update(data) {
    var value = flag ? "revenue" : "profit";
    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);

    x.domain(data.map((d) => d.month));
    y.domain([0, d3.max(data, (d) => d[value])]);
    
    xAxisGroup.call(xAxisCall);
    yAxisGroup.call(yAxisCall);

    // Cambiar color del texto de los ejes a blanco
    xAxisGroup.selectAll("text").attr("fill", "white");
    yAxisGroup.selectAll("text").attr("fill", "white");

    // Cambiar color de las líneas del eje si quieres también (opcional)
    xAxisGroup.selectAll("path").attr("stroke", "white");
    xAxisGroup.selectAll("line").attr("stroke", "white");
    yAxisGroup.selectAll("path").attr("stroke", "white");
    yAxisGroup.selectAll("line").attr("stroke", "white");

    var bars = g.selectAll("rect.bar").data(data);

    bars.exit().remove();

    bars.attr("x", (d) => x(d.month))
        .attr("y", (d) => y(d[value]))
        .attr("width", x.bandwidth)
        .attr("height", (d) => height - y(d[value]));

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.month))
        .attr("y", (d) => y(d[value]))
        .attr("width", x.bandwidth)
        .attr("height", (d) => height - y(d[value]))
        .attr("fill", "yellow");
}

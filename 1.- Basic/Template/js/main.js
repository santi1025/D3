var svg = d3.select("#chart-area").append("svg")
	.attr("width", 500)
	.attr("height", 400);

var circle = svg.append("circle")
	.attr("cx", 400)
	.attr("cy", 260)
	.attr("r", 70)
	.attr("fill", "green");

var rect = svg.append("rect")
	.attr("x", 20)
	.attr("y", 20)
	.attr("width", 20)
	.attr("height", 20)
	.attr("fill","red");
// Load and process data
d3.json("data/data.json").then(data => {
    const formattedData = data.map(year => ({
        year: year.year,
        countries: year.countries.filter(d => d.income && d.life_exp).map(d => ({
            ...d,
            income: +d.income,
            life_exp: +d.life_exp,
            population: +d.population
        }))
    }));

    // SET UP SVG DIMENSIONS
const margin = { top: 50, right: 200, bottom: 50, left: 100 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// DEFINE SCALES
const xScale = d3.scaleLog()
    .domain([142, 150000])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, 90])
    .range([height, 0]);

const areaScale = d3.scaleLinear()
    .domain([2000, 1400000000])
    .range([25 * Math.PI, 1500 * Math.PI]);

const colorScale = d3.scaleOrdinal(d3.schemePastel1);

// ADD AXES
const xAxis = d3.axisBottom(xScale)
    .tickValues([400, 4000, 40000])
    .tickFormat(d => `$${d}`);

const yAxis = d3.axisLeft(yScale);

svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

svg.append("g")
    .call(yAxis);

// ADD AXIS LABELS
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("INCOME PER CAPITA ($)");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .text("LIFE EXPECTANCY (YEARS)");

// ADD YEAR LABEL
const yearLabel = svg.append("text")
    .attr("x", width - 100)
    .attr("y", height - 10)
    .attr("font-size", "24px")
    .attr("fill", "black")
    .text("YEAR:");

// FUNCTION TO UPDATE THE VISUALIZATION
function update(yearData) {
    const filteredData = yearData.countries.filter(d => d.income && d.life_exp)
        .map(d => ({
            ...d,
            income: +d.income,
            life_exp: +d.life_exp
        }));

    const circles = svg.selectAll("circle").data(filteredData, d => d.country);

    // ENTER - CREATE NEW ELEMENTS
    circles.enter()
        .append("circle")
        .attr("cx", d => xScale(d.income))
        .attr("cy", d => yScale(d.life_exp))
        .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI))
        .attr("fill", d => colorScale(d.continent))
        .merge(circles) // UPDATE - MODIFY EXISTING ELEMENTS
        .transition().duration(1000)
        .attr("cx", d => xScale(d.income))
        .attr("cy", d => yScale(d.life_exp))
        .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI));

    // EXIT - REMOVE UNUSED ELEMENTS
    circles.exit().remove();

    // UPDATE YEAR LABEL
    yearLabel.text(`YEAR: ${yearData.year}`);
}

// GET UNIQUE CONTINENTS FOR LEGEND
const continents = [...new Set(data.flatMap(year => year.countries.map(d => d.continent)))];

// CREATE LEGEND GROUP
const legend = svg.append("g")
    .attr("transform", `translate(${width + 30}, 50)`);

// ADD LEGEND ITEMS
continents.forEach((continent, i) => {
    legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 25)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", colorScale(continent));

    legend.append("text")
        .attr("x", 30)
        .attr("y", i * 25 + 15)
        .text(continent)
        .attr("font-size", "14px")
        .attr("alignment-baseline", "middle");
});

// AUTOMATIC ANIMATION THROUGH YEARS
let yearIndex = 0;
setInterval(() => {
    update(data[yearIndex]);
    yearIndex = (yearIndex + 1) % data.length;
}, 1000);

});

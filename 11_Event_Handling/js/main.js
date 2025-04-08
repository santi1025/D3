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
    const margin = { top: 50, right: 200, bottom: 100, left: 100 };
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

    const colorScale = d3.scaleOrdinal(d3.schemeSet2);

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
    function update(yearData, continentFilter) {
        const filteredData = yearData.countries.filter(d => {
            // Filter by continent if selected, or show all
            return continentFilter === "All" || d.continent === continentFilter;
        }).map(d => ({
            ...d,
            income: +d.income,
            life_exp: +d.life_exp,
            population: +d.population
        })).filter(d => {
            // Ensure data is valid (no NaN or undefined values for income, life_exp, or population)
            return !isNaN(d.income) && !isNaN(d.life_exp) && !isNaN(d.population) && d.income > 0 && d.life_exp > 0 && d.population > 0;
        });
    
        const circles = svg.selectAll("circle").data(filteredData, d => d.country);
    
        // ENTER - CREATE NEW ELEMENTS
        circles.enter()
            .append("circle")
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yScale(d.life_exp))
            .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI))
            .attr("fill", d => colorScale(d.continent))
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`<strong>Country:</strong> ${d.country}<br><strong>Income:</strong> $${d.income.toFixed(0)}<br><strong>Life Expectancy:</strong> ${d.life_exp.toFixed(1)}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            })
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
    let intervalId = null;

    // PLAY/PAUSE BUTTON
    const playPauseButton = d3.select("body").append("button")
        .text("Pause")
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("left", "20px")
        .style("z-index", 10)
        .on("click", function() {
            if (playPauseButton.text() === "Pause") {
                clearInterval(intervalId);
                playPauseButton.text("Play");
            } else {
                intervalId = setInterval(() => {
                    yearIndex = (yearIndex + 1) % data.length;
                    update(data[yearIndex], continentDropdown.property("value"));
                    yearSlider.property("value", yearIndex);
                    sliderLabel.text(`Year: ${data[yearIndex].year}`);
                }, 1000);
                playPauseButton.text("Pause");
            }
        });

    // RESET BUTTON
    const resetButton = d3.select("body").append("button")
        .text("Reset")
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("left", "100px")
        .style("z-index", 10)
        .on("click", function() {
            yearIndex = 0;
            update(data[yearIndex], continentDropdown.property("value"));
            yearSlider.property("value", yearIndex);
            sliderLabel.text(`Year: ${data[yearIndex].year}`);
        });

    // SLIDER LABEL
    const sliderLabel = d3.select("body").append("span")
        .style("position", "absolute")
        .style("bottom", "40px")
        .style("left", "180px")
        .text(`Year: ${data[yearIndex].year}`)
        .style("z-index", 10);

    // SLIDER FOR YEAR CONTROL
    const yearSlider = d3.select("body").append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", data.length - 1)
        .attr("value", yearIndex)
        .attr("step", 1)
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("left", "180px")
        .style("width", "300px")
        .style("z-index", 10)
        .on("input", function() {

            if (playPauseButton.text() === "Pause") {
                clearInterval(intervalId);
                playPauseButton.text("Play");
            }
            
            // Update the year index
            yearIndex = +this.value;
            
            // Update visualization
            update(data[yearIndex], continentDropdown.property("value"));
            
            // Update the slider label
            sliderLabel.text(`Year: ${data[yearIndex].year}`);
        });

    // DROPDOWN MENU FOR CONTINENT FILTER
    const continentDropdown = d3.select("body").append("select")
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("left", "500px")
        .style("z-index", 10)
        .on("change", function() {
            const selectedContinent = this.value;
            update(data[yearIndex], selectedContinent);
        });

    // Add "All" option for displaying all continents
    continentDropdown.selectAll("option")
        .data(["All", ...continents])
        .enter().append("option")
        .text(d => d);

    // TOOLTIP FOR COUNTRY INFO
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0,0,0,0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none");

    // START ANIMATION
    intervalId = setInterval(() => {
        yearIndex = (yearIndex + 1) % data.length;
        update(data[yearIndex], continentDropdown.property("value"));
        yearSlider.property("value", yearIndex);
        sliderLabel.text(`Year: ${data[yearIndex].year}`);
    }, 1000);

    // INITIAL UPDATE
    update(data[yearIndex], continentDropdown.property("value"));
});
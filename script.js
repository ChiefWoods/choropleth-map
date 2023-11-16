Promise.all([
  d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'),
  d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
]).then(([countyData, educationData]) => {
  const width = 960;
  const height = 600;
  const colorScheme = d3.schemePurples[9];

  // Title
  d3.select('main')
    .append('h1')
    .text('United States Educational Attainment')
    .attr('id', 'title')
    .style('font-size', '5.6rem')
    .style('font-family', 'Arial')
    .style('font-weight', 700)
    .style('margin-bottom', '37.5px')

  // Description
  d3.select('main')
    .append('p')
    .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)')
    .attr('id', 'description')
    .style('font-size', '1.6rem')
    .style('font-family', 'Arial')
    .style('margin-bottom', '20px')

  // Main SVG
  const svg = d3.select('main')
    .append('svg')
    .style('width', width)
    .style('height', height)

  // Source
  d3.select('main')
    .append('span')
    .html('Source: <a href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx" target="_blank">USDA Economic Research Service</a>')
    .attr('class', 'source')
    .style('font-size', '1.6rem')
    .style('font-family', 'Arial')
    .style('margin-top', '16px')
    .style('margin-left', 'auto')

  d3.select('.source a')
    .style('cursor', 'pointer')
    .style('color', 'blue')
    .style('text-decoration', 'none')
    .on('mouseover', () => {
      d3.select('.source a')
        .style('text-decoration', 'underline')
    })
    .on('mouseout', () => {
      d3.select('.source a')
        .style('text-decoration', 'none')
    })

  // Legend
  const legendHeight = 8;
  const bachelors = educationData.map(d => d.bachelorsOrHigher);
  const minBachelor = d3.min(bachelors);
  const maxBachelor = d3.max(bachelors);
  const step = (maxBachelor - minBachelor) / (colorScheme.length - 1);

  const legendThreshold = d3.scaleThreshold()
    .domain(d3.range(minBachelor, maxBachelor, step))
    .range(colorScheme);

  const legendXScale = d3.scaleLinear()
    .domain([minBachelor, maxBachelor - step])
    .rangeRound([600, 860])

  const legendXAxis = d3.axisBottom(legendXScale)
    .tickSize(13)
    .tickValues(legendThreshold.domain())
    .tickFormat(x => Math.round(x) + '%')

  const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(0, 40)')

  legend.append('g')
    .selectAll('rect')
    .data(legendThreshold.range().map(color => {
      const d = legendThreshold.invertExtent(color);

      if (d[0] === null) {
        d[0] = legendXScale.domain()[0]
      }
      if (d[1] === null) {
        d[1] = legendXScale.domain()[1]
      }

      return d;
    }))
    .enter()
    .append('rect')
    .attr('x', d => legendXScale(d[0]))
    .attr('y', 0)
    .style('width', d => legendXScale(d[1]) - legendXScale(d[0]))
    .style('height', legendHeight)
    .style('fill', d => legendThreshold(d[0]))

  legend.append('g')
    .call(legendXAxis)
    .select('.domain')
    .remove()

  // Tooltip
  const tooltip = d3.select('main')
    .append('div')
    .attr('id', 'tooltip')
    .style('visibility', 'hidden')
    .style('position', 'absolute')
    .style('opacity', 0)
    .style('background-color', 'rgba(255, 255, 204, 0.9)')
    .style('padding', '10px')
    .style('border-radius', '2px')
    .style('box-shadow', '1px 1px 10px rgba(128, 128, 128, 0.6)')
    .style('font-size', '1.2rem')
    .style('font-family', 'Arial')

  // Map
  const path = d3.geoPath();

  svg.append('path')
    .datum(topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b))
    .attr('d', path)
    .style('fill', 'none')
    .style('stroke', 'white')
    .style('stroke-linejoin', 'round')

  svg.append('g')
    .selectAll('path')
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', d => d.id)
    .attr('data-education', d => {
      const county = educationData.filter(obj => obj.fips === d.id)[0];
      return county.bachelorsOrHigher;
    })
    .attr('d', path)
    .style('fill', d => {
      const county = educationData.filter(obj => obj.fips === d.id)[0];
      return legendThreshold(county.bachelorsOrHigher);
    })
    .on('mouseover', (e, d) => {
      const county = educationData.filter(obj => obj.fips === d.id)[0];

      tooltip.style('visibility', 'visible')
        .style('opacity', 0.9)
        .style('left', `${e.pageX + 10}px`)
        .style('top', `${e.pageY - 28}px`)

      tooltip.html(`${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`)
        .attr('data-education', county.bachelorsOrHigher)
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden')
        .style('opacity', 0)
    })
}).catch(error => console.error(error));

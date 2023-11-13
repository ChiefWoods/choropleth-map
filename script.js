d3.json([
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
]).then(([educationData, countyData]) => {
  
}).catch(error => console.error(error));
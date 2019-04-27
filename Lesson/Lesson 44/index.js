// select the svg container first
const svg = d3.select('.canvas')
  .append('svg')
    .attr('width', 600)
    .attr('height', 600);

// create margins & dimensions
const margin = {top: 20, right: 20, bottom: 100, left: 100};
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// create axes groups
const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`)

const yAxisGroup = graph.append('g');


// Scale
const y = d3.scaleLinear()
  .range([graphHeight, 0]); // reverst values for ticks right

const x = d3.scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// create & call axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(4)
  .tickFormat(d => d + ' orders');




//Refactoring transition code
const t = d3.transition().duration(500);

// creating data update function
const update = (data) => {

  //1. adding scale domain update
  y.domain([0, d3.max(data, d => d.orders)]);
  x.domain(data.map(item => item.name));

  //2. Join the data to rects
  const rects = graph.selectAll('rect')
    .data(data);

  // remove exit selection
  rects.exit().remove()

  //3. Update current shapes in dom
  rects.attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', (d) => x(d.name))
    // .transition(t)
    //   .attr('y', (d) => y(d.orders))
    //   .attr("height", d => graphHeight - y(d.orders));


  //4. append the enter selection to the DOM
  rects.enter()
    .append('rect')
      .attr('width', x.bandwidth)
      .attr('height', 0)
      .attr('fill', 'orange')
      .attr('x', (d) => x(d.name))
      .attr('y', graphHeight)
      .merge(rects)  //after this apply this below to code to rects group as well
      .transition(t)
        .attr('y', (d) => y(d.orders))
        .attr("height", d => graphHeight - y(d.orders));


  // call axis
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // Update x axis text
  xAxisGroup.selectAll('text')
      .attr('transform', 'rotate(-40)')
      .attr('text-anchor', 'end')
      .attr('fill', 'red');

};


var data = [];

//get data from firestore
db.collection('dishes').onSnapshot(res => {
  
  res.docChanges().forEach(change => {
    
    //using split operator
    const doc = {...change.doc.data(), id: change.doc.id};

    switch(change.type){
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        //finding index of data need to update
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;  //overriding data
        break;
      case 'removed':
        //keep only those data which fulfils conditions
        data = data.filter(item => item.id !== doc.id)
        break;
      default:
        break;

    }


  });
  
  update(data);
});
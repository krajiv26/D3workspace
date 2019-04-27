const margin = { top: 20, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.right - margin.left;
const graphHeight = 360 - margin.top - margin.bottom;

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphHeight + margin.top + margin.bottom);

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left},${margin.top})`);

//scales
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

//axis
const xAxisGroup = graph.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${graphHeight})`);

const yAxisGroup = graph.append('g')
    .attr('class', 'y-axis');

//d3 line path generator
const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.distance))
//line path element
const linepath = graph.append('path');

// create dotted line group and append to graph
const dottedLines = graph.append('g')
    .attr('class', 'lines')
    .style('opacity',0);
// create x dotted line and append to dotted line group
const xDottedLine = dottedLines.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);
// create y dotted line and append to dotted line group
const yDottedLine = dottedLines.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);

const update = (data) => {
    //filter data on the basis of activity selected
    data = data.filter(item => item.activity == activity);

    //sorting data on the base of date
    data.sort((a,b) => new Date(a.date) - new Date(b.date));

    // set scale domain
    x.domain(d3.extent(data, d => new Date(d.date)));
    y.domain([0, d3.max(data, d => d.distance)]);

    // update line path
    linepath.data([data]) //data should in array for line generator
        .attr('fill', 'none')
        .attr('stroke', '#00bfa5')
        .attr('stroke-width', 2)
        .attr('d', line)

    //create circles for objects point
    const circles = graph.selectAll('circle')
        .data(data);

    // remove exit selection
    circles.exit().remove();

    //update current points
    circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance))


    // add new points
    circles.enter()
        .append('circle')
        .attr('r',4)
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance))
        .attr('fill', '#ccc');


    //some transition to points
    graph.selectAll('circle')
        .on('mouseover', (d,i,n) => {
            d3.select(n[i])
                .transition().duration(100)
                .attr('r', 8)
                .attr('fill','#fff');
            // set x dotted line coords (x1,x2,y1,y2)
            xDottedLine
                .attr('x1', x(new Date(d.date)))
                .attr('x2', x(new Date(d.date)))
                .attr('y1', graphHeight)
                .attr('y2', y(d.distance));
            // set y dotted line coords (x1,x2,y1, y2)
            yDottedLine
                .attr('x1', 0)
                .attr('x2', x(new Date(d.date)))
                .attr('y1', y(d.distance))
                .attr('y2', y(d.distance));
            //show the dotted line group (.style, opacity)
            dottedLines.style('opacity',1);
        })
        .on('mouseout', (d,i,n) => {
            d3.select(n[i])
                .transition().duration(100)
                .attr('r', 4)
                .attr('fill','#ccc');
            // hide the dotted line group (.style, opacity)
            dottedLines.style('opacity',0);
        })
    // create axis
    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'));
    
    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + 'm');

    
    // calling axes inside group
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // rotate the x-axix text
    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor','end');

}


// data array and firestore
var data = [];

db.collection('activities').orderBy('date').onSnapshot(res => {

  res.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id};

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }

  });

  // call the update function
  update(data);

});
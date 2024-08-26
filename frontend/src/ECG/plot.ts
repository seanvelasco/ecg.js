// import * as d3 from 'd3'

// export const plot = (coordinateData: any[], order: any[], grid: [number, number]) => {
//     // Chart styles

//     const lineColor = '#000000'
//     const lineWidth = 0.75
//     const minorGridColor = '#ffbfc0'
//     const majorGridColor = '#ff7f7f'
//     const minorGridWidth = 0.5
//     const majorGridWidth = 0.5
//     const textColor = '#000000'
//     const textSize = '0.75em'
//     const textFont = 'sans-serif'

//     // Grids or number of squares vertically and horizontally

//     const numberOfSquaresVertically = grid[0] // || 6
//     const numberOfSquaresHorizontal = grid[1] // || 12.5 // 13.75 12.5

//     // Page size

//     const DPI = 96
//     const height = ((numberOfSquaresVertically * 5) * DPI) / 25.4
//     const width = (((numberOfSquaresHorizontal * 4) * 5) * DPI) / 25.4 / 4

//     // Duration: number of data points in the x-axis, which is time in ms

//     const duration = (Object.values(coordinateData?.[0]?.[0] || {})?.[0] as any)?.length

//     // SVG DOM creation

//     const svg = d3.create("svg")

//     // Create document

//     svg
//         .attr('width', width * 4)
//         .attr('height', height * order.length)
//         .attr('preserveAspectRatio', 'xMinYMin')
//         .attr('shape-rendering', "crispEdges")
//         .style('fill', 'none')

//     // Draw white background across chart

//     svg.append('rect')
//         .attr('width', '100%')
//         .attr('height', '100%')
//         .attr('fill', 'white')

//     // Scales

//     console.log("height", height)

//     const xScale = d3.scaleLinear().range([0, width * 4]).domain([0, duration * 4]).clamp(false)

//     const yScale = d3.scaleLinear().range([-height / 2, height / 2]).domain([-1.5, 1.5]).clamp(false)

//     // Use above scales to create grid

//     const xMajorGrid = d3.axisTop(xScale).ticks(numberOfSquaresHorizontal * 4).tickSize(-height).offset(0).tickFormat(() => '')

//     const xMinorGrid = d3.axisTop(xScale).ticks((numberOfSquaresHorizontal * 4) * 5).tickSize(-height).offset(0).tickFormat(() => '')

//     const yMajorGrid = d3.axisLeft(yScale).ticks(numberOfSquaresVertically).tickSize(-width * 4).offset(0).tickFormat(() => '')

//     const yMinorGrid = d3.axisLeft(yScale).ticks(numberOfSquaresVertically * 5).tickSize(-width * 4).offset(0).tickFormat(() => '')

//     // Line

//     const line = d3.line()
//         .x((d: [number, number]) => xScale(d[0]))
//         .y((d: [number, number]) => yScale(d[1]))


//     // Logic:
//     // Draw grids in groups
//     // For each group, draw lines and text

//     for (let channel = 0; channel < order.length; channel++) {

//         svg
//             .append('g')
//             .style('color', minorGridColor)
//             .style('stroke-width', minorGridWidth)
//             .attr('transform', `translate(0, ${height * channel})`)
//             .call(xMinorGrid)

//         svg
//             .append('g')
//             .style('color', minorGridColor)
//             .style('stroke-width', minorGridWidth)
//             .attr('transform', `translate(0, ${height * channel})`)
//             .call(yMinorGrid)

//         svg
//             .append('g')
//             .style('color', majorGridColor)
//             .style('stroke-width', majorGridWidth)
//             .attr('transform', `translate(0, ${height * channel})`)
//             .call(xMajorGrid)

//         svg
//             .append('g')
//             .style('color', majorGridColor)
//             .style('stroke-width', majorGridWidth)
//             .attr('transform', `translate(0, ${height * channel})`)
//             .call(yMajorGrid)

//         for (let label = 0; label < order[channel].length; label++) {

//             const slice = width * 4 / order[channel].length

//             svg.append('path')
//                 .attr('d', line(coordinateData[channel][label][order[channel][label]]))
//                 .attr('transform', `translate(${(slice) * label}, ${height * channel})`)
//                 .style('stroke', lineColor)
//                 .style('stroke-width', lineWidth)
//                 .attr('shape-rendering', "geometricPrecision")
//                 .attr('stroke-linejoin', 'round')
//                 .append('title').text(order[channel][label])

//             svg
//                 .append('text')
//                 .attr('x', (slice) * label)
//                 .attr('y', (height / 2) + (height * channel) + 19)
//                 .attr('font-size', textSize)
//                 .attr('font-family', textFont)
//                 .attr('fill', textColor)
//                 .text(order[channel][label])
//         }
//     }

//     // Return SVG document that can be appended to an HTML element

//     return svg.node()
// }
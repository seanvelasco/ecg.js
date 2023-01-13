import { JSDOM } from 'jsdom'
import * as d3 from 'd3'

// Page setup
const lineColor = '#000000'
const lineWidth = 0.75
const minorGridColor = '#ffbfc0'
const majorGridColor = '#ff7f7f'
const minorGridWidth = 0.5
const majorGridWidth = 0.5
const textColor = '#000000'
const textSize = '0.75em'
const textFont = 'sans-serif'

const DPI = 96 // Scaling factor
const height = (30 * DPI) / 25.4
const width = (250 * DPI) / 25.4 / 4

// padding adds 

const plot = (coordinateData: any, order) => {

	const { document } = new JSDOM('').window // DOM creation

	const svg = d3.select(document).select('body').append('svg')  // SVG element creation

	svg.append('title').text('ECG Chart') // Title of the SVG document

	svg
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
		.attr('width', width * 4)
		.attr('height', height * order.length)
		.attr('shape-rendering', "crispEdges")
		.style('fill', 'none') // Creates a line

	// Create a white background

	svg.append('rect')
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('fill', 'white')

	// GE = 5000
	// Philips = 5500

	const xScale = d3.scaleLinear().range([0, width * 4]).domain([0, 5500]).clamp(false)

	// SVG y-coordinates start at the top and increases in value going down
	// The range or domain, therefore, should be reversed
	// Otherwise, the line will be inverted in the y-axis

	const yScale = d3.scaleLinear().range([height, 0]).domain([-300, 300]).clamp(false)

	const line = d3.line()
		.x((d: [number, number]) => xScale(d[0]))
		.y((d: [number, number]) => yScale(d[1]))

	// Setting tickSize to negative page size is a trick to make the lines span across the chart
	// Setting offset to 0 removes padding from the tick labels
	// Setting tickFormat to an empty string removes the tick labels
	// There should be 50 large squares horizontally
	const xMajorGrid = d3.axisTop(xScale).ticks(50).tickSize(-height).offset(0).tickFormat(() => '')

	// There are 5 small squares across a large square, therefore there should be 250 small squares horizontally
	const xMinorGrid = d3.axisTop(xScale).ticks(50 * 5).tickSize(-height).offset(0).tickFormat(() => '')

	// On a single channel, there should be 6 large squares vertically
	const yMajorGrid = d3.axisLeft(yScale).ticks(6).tickSize(-width * 4).offset(0).tickFormat(() => '')

	// There are 5 small squares across a large square, therefore there should be 30 small squares vertically
	const yMinorGrid = d3.axisLeft(yScale).ticks(6 * 5).tickSize(-width * 4).offset(0).tickFormat(() => '')

	for (let channel = 0; channel < order.length; channel++) {

		svg
			.append('g')
			.style('color', minorGridColor)
			.style('stroke-width', minorGridWidth)
			.attr('transform', `translate(0, ${height * channel})`)
			.call(xMinorGrid)

		svg
			.append('g')
			.style('color', minorGridColor)
			.style('stroke-width', minorGridWidth)
			.attr('transform', `translate(0, ${height * channel})`)
			.call(yMinorGrid)

		svg
			.append('g')
			.style('color', majorGridColor)
			.style('stroke-width', majorGridWidth)
			.attr('transform', `translate(0, ${height * channel})`)
			.call(xMajorGrid)

		svg
			.append('g')
			.style('color', majorGridColor)
			.style('stroke-width', majorGridWidth)
			.attr('transform', `translate(0, ${height * channel})`)
			.call(yMajorGrid)

		for (let label = 0; label < order[channel].length; label++) {

			const slice = width * 4 / order[channel].length

			svg.append('path')
				.attr('d', line(coordinateData[channel][label][order[channel][label]]))
				.attr('transform', `translate(${(slice) * label}, ${height * channel})`)
				.style('stroke', lineColor)
				.style('stroke-width', lineWidth)
				.attr('shape-rendering', "geometricPrecision")
				.attr('stroke-linejoin', 'round')
				.append('title').text(order[channel][label])

			svg
				.append('text')
				.attr('x', (slice) * label)
				.attr('y', (height / 2) + (height * channel) + 19)
				.attr('font-size', textSize)
				.attr('font-family', textFont)
				.attr('fill', textColor)
				.text(order[channel][label])
		}
	}

	return document.documentElement.getElementsByTagName('svg')[0].outerHTML
}

export {
	plot
}
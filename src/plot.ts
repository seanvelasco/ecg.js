import { JSDOM } from 'jsdom'
import * as d3 from 'd3'

const plot = (data: [number, number][][], labels?: string[], barcode?: string) => {

	const lineColor = '#000000'
	const lineWidth = 0.75
	const minorGridColor = '#ffbfc0'
	const majorGridColor = '#ff7f7f'
	const minorGridWidth = 0.5
	const majorGridWidth = 0.5
	const textColor = '#000000'
	const textSize = '0.75em'
	const textFont = 'sans-serif'

	const DPI = 120
	const height = (30 * DPI) / 25.4
	const width = (250 * DPI) / 25.4

	// DOM creation

	const { document } = new JSDOM('').window

	const svg = d3.select(document).select('body').append('svg')

	svg.append('title').text(barcode || 'ECG Chart')

	svg
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
		.attr('width', width)
		.attr('height', height * 4)
		.attr('shape-rendering', "crispEdges")
		.style('fill', 'none') // Makes the line not filled
		.style('stroke-width', 0)

	svg.append('rect')
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('fill', 'white')

	const xScale = d3.scaleLinear().range([0, width]).domain([0, 5000])

	// SVG y-coordinates start at the top then increases in value going down
	// The range OR domain, therefore, should be reversed
	// Otherwise, the line will be inverted in the y-axis

	const yScale = d3.scaleLinear().range([height, 0]).domain([-300, 300])

	const line = d3.line()
		.x((d: [number, number]) => xScale(d[0]))
		.y((d: [number, number]) => yScale(d[1]))

	const xMajorGrid = d3.axisTop(xScale).ticks(50).tickSize(-height).offset(0).tickFormat(() => '')
	const xMinorGrid = d3.axisTop(xScale).ticks(50 * 5).tickSize(-height).offset(0).tickFormat(() => '')

	const yMajorGrid = d3.axisLeft(yScale).ticks(6).tickSize(-width).offset(0).tickFormat(() => '')
	const yMinorGrid = d3.axisLeft(yScale).ticks(6 * 5).tickSize(-width).offset(0).tickFormat(() => '')

	// Generate grid

	for (const channel in d3.range(data.length)) {

		svg
			.append('g')
			.style('color', minorGridColor)
			.style('stroke-width', minorGridWidth)
			.attr('transform', `translate(0, ${height * parseInt(channel)})`)
			.call(xMinorGrid)

		svg
			.append('g')
			.style('color', minorGridColor)
			.style('stroke-width', minorGridWidth)
			.attr('transform', `translate(0, ${height * parseInt(channel)})`)
			.call(yMinorGrid)

		svg
			.append('g')
			.style('color', majorGridColor)
			.style('stroke-width', majorGridWidth)
			.attr('transform', `translate(0, ${height * parseInt(channel)})`)
			.call(xMajorGrid)

		svg
			.append('g')
			.style('color', majorGridColor)
			.style('stroke-width', majorGridWidth)
			.attr('transform', `translate(0, ${height * parseInt(channel)})`)
			.call(yMajorGrid)
	}

	const generateLabel = (text: string, x: number, y: number) => {
		svg
			.append('text')
			.attr('x', x)
			.attr('y', y)
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'start')
			.attr('font-size', textSize)
			.attr('font-family', textFont)
			.attr('fill', textColor)
			.text(text)

	}

	// Generate lines and labels

	for (const channel in d3.range(data.length)) {
		svg.append('path')
			.attr('d', line(data[channel]))
			.attr('transform', `translate(0, ${height * parseInt(channel)})`)
			.style('stroke', lineColor)
			.style('stroke-width', lineWidth)
			.attr('shape-rendering', "geometricPrecision")
			.attr('stroke-linejoin', 'round')

		const group1 = ['I', 'aVR', 'V1', 'V4']
		const group2 = ['II', 'aVL', 'V2', 'V5']
		const group3 = ['III', 'aVF', 'V3', 'V6']
		const group4 = ['II']

		generateLabel(group1[channel], (width / 4 * parseInt(channel)), (height / 2 - 25))
		generateLabel(group2[channel], ((width) / 4 * parseInt(channel)), (height / 2 + height - 25))
		generateLabel(group3[channel], ((width) / 4 * parseInt(channel)), (height / 2 + (height * 2) - 25))
		generateLabel(group4[channel], ((width) / 4 * parseInt(channel)), (height / 2 + (height * 3) - 25))

	}

	return document.documentElement.getElementsByTagName('svg')[0].outerHTML

}

export {
	plot
}
import jsdom from 'jsdom'
import * as d3 from 'd3'
import { range } from 'd3'

const arrange = (start: number, stop: number, step: number) => {
	const arr: number[] = []
	for (let i = start; i < stop; i += step) {
		arr.push(i)
	}
	return arr
}

const plot = (data: [number, number][][], labels?: string[], barcode?: string) => {

	const lineColor = '#000000'
	const lineWidth = 0.75 // 0.5
	const minorGridColor = '#ffbfc0'
	const majorGridColor = '#ff7f7f'
	const minorGridWidth = 0.5
	const majorGridWidth = 0.5
	const borderWidth = 2
	const textColor = '#000000'
	const textSize = '0.75em'
	const textFont = 'sans-serif'

	const DPI = 120
	const height = (30 * DPI) / 25.4
	const width = (250 * DPI) / 25.4





	const xMajorTicks = arrange(xMin, xMax, 0.2 * cm * pixels)
	const yMajorTicks = arrange(yMin, yMax, 0.5 * cm * pixels)

	const xMinorTicks = arrange(xMin, xMax, 0.04 * cm * pixels)
	const yMinorTicks = arrange(yMin, yMax, 0.1 * cm * pixels)

	// Scales

	const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width])

	// SVG y-coordinates start at the top then increases in value going down
	// The range OR domain, therefore, should be reversed
	// Otherwise, the line will be inverted in the y-axis

	const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

	// DOM creation

	const { JSDOM } = jsdom

	const { document } = new JSDOM('').window

	const body = d3.select(document).select('body')

	const svg = body
		.append('svg')
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
		.attr('width', width)
		.attr('height', height)
		.attr('style', `border: ${borderWidth / 2}px solid ${majorGridColor};`) // Outer border
		.attr('shape-rendering', "crispEdges")

	// add rect
	svg.append('rect')
		.attr('width', width)
		.attr('height', height)
		.attr('fill', 'white')

	const generateMetadata = () => {
		if (barcode) {
			svg.append('title').text(barcode)
		} else {
			svg.append('title').text('ECG Chart')
		}
	}

	const generateGrid = () => {
		const xMajorAxisGrid = d3.axisTop(xScale).tickValues(xMajorTicks).tickSize(-height)

		const yMajorAxisGrid = d3.axisLeft(yScale).tickValues(yMajorTicks).tickSize(-width)

		const xMinorAxisGrid = d3.axisTop(xScale).tickValues(xMinorTicks).tickSize(-height)

		const yMinorAxisGrid = d3.axisLeft(yScale).tickValues(yMinorTicks).tickSize(-width)

		// Render minor grids first
		// Otherwise, minor grids will cover major grids

		svg
			.append('g')
			.attr('class', 'minor-grid')
			.style('color', minorGridColor)
			.style('stroke-width', minorGridWidth)
			.call(xMinorAxisGrid)

		svg
			.append('g')
			.attr('class', 'minor-grid')
			.style('color', minorGridColor)
			.style('stroke-width', minorGridWidth)
			.call(yMinorAxisGrid)

		svg
			.append('g')
			.attr('class', 'major-grid')
			.style('color', majorGridColor)
			.style('stroke-width', majorGridWidth)
			.call(xMajorAxisGrid)

		svg
			.append('g')
			.attr('class', 'major-grid')
			.style('color', majorGridColor)
			.style('stroke-width', majorGridWidth)
			.call(yMajorAxisGrid)

		// Offset grids by 0.5 to balance off extra width
		// Both x, y major & minor grids contribute 0.5 extra width
		// Move grid upwards and towards the left to hide extra ticks

		svg.selectAll('.major-grid ').attr('transform', 'translate(-0.5, -0.5)')

		svg.selectAll('.minor-grid ').attr('transform', 'translate(-0.5, -0.5)')
	}

	const generateBorder = () => {
		svg
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', width)
			.attr('height', height)
			.style('fill', 'none')
			.style('stroke', majorGridColor)
			.style('stroke-width', borderWidth / 2) // Inner border
	}

	const generateLabels = (text: string, x: number, y: number) => {
		// Center: (width / 2) - (textWidth / 2) & (height / 2) - (textHeight / 2)

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

	const group1 = ['I', 'II', 'III', 'II']
	const group2 = ['aVR', 'aVL', 'aVF']
	const group3 = ['V1', 'V2', 'V3']
	const group4 = ['V4', 'V5', 'V6']

	const generateLines = () => {
		for (const lead of range(rows)) {
			const displacement = lead * (3 * cm) * pixels

			// this dispalces the chart
			for (const point in data[lead]) {
				data[lead][point][1] -= displacement
			}

			const line = d3
				.line()
				.x((d: [number, number]) => xScale(d[0]))
				.y((d: [number, number]) => yScale(d[1]))

			svg
				.append('path')
				.attr('d', line(data[lead]))
				.style('stroke', lineColor)
				.style('stroke-width', lineWidth)
				.style('fill', 'none')

			// Hardcoded coordinates for texts
			// Ideally, these would be calculated based on page dimensions


			const offset = 10
			const yOffset = 20

			generateLabels(group1[lead], (width / 4) * 0 + offset, height / 8 + displacement - yOffset)
			generateLabels(group2[lead], (width / 4) * 1 + offset, height / 8 + displacement - yOffset)
			generateLabels(group3[lead], (width / 4) * 2 + offset, height / 8 + displacement - yOffset)
			generateLabels(group4[lead], (width / 4) * 3 + offset, height / 8 + displacement - yOffset)
		}
	}

	// const generateLines = () => {
	// 	for (const lead of range(rows)) {
	// 		const offset = lead * (3 * cm) * pixels

	// 		for (const point in data[lead]) {
	// 			data[lead][point][1] -= offset
	// 		}

	// 		const line = d3
	// 			.line()
	// 			.x((d: any) => xScale(d[0]))
	// 			.y((d: any) => yScale(d[1]))

	// 		svg
	// 			.append('path')
	// 			.attr('d', line(data[lead]))
	// 			.style('stroke', lineColor)
	// 			.style('stroke-width', lineWidth)
	// 			.style('fill', 'none')

	// 		// Hardcoded coordinates for texts
	// 		// Ideally, these would be calculated based on page dimensions
	// 		generateLabels(leadLabels[lead], 22, 54 + offset)
	// 	}
	// }

	// Take note that rendering the grid is independent from rendering the lines
	// A change in the position of the lines will not affect the grid
	// Likewise, a change in the position of the grid will not affect the lines
	// However, the data & scale from which the lines and grid are drawn are the same

	// Order of rendering is important
	generateMetadata()
	generateGrid()
	generateLines()
	generateBorder()

	const svgElement = document.documentElement.getElementsByTagName('svg')[0].outerHTML

	return svgElement
}

export {
	plot
}
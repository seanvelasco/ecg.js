import * as d3 from "d3"
import Philips from "./ECG/formats/Philips"

class ECG {
    channels: any
    order
    format


    constructor(xmlString: string, format: "3x4" | "12x1" = "3x4") {

        const orders = {
            "3x4": [
                ["I", "AVR", "V1", "V5"],
                ["II", "AVL", "V2", "V5"],
                ["III", "AVF", "V3", "V6"],
                ["II"]
            ],
            "12x1": [
                ["I"],
                ["II"],
                ["III"],
                ["AVR"],
                ["AVL"],
                ["AVF"]
                ["V1"],
                ["V2"],
                ["V3"],
                ["V4"],
                ["V5"],
                ["V6"],
            ]
        }
        this.format = format
        this.order = orders[this.format]
        const temporaryChannels = this.parse(xmlString)
        this.channels = this.groupData(temporaryChannels)
    }

    private parse = (xml: string) => {

        const xmlParser = new DOMParser()

        const xmlDoc = xmlParser.parseFromString(xml, "text/xml")

        // if (xml.includes("SierraECG")) {
        //     this.channels = parser(xmlDoc)
        // }

        return Philips(xmlDoc)
    }

    private transformToCoordinate = (dataset: number[]): [number, number][] => {
        return dataset.map((y, x) => [x, y])
    }

    private groupData = (
        channels: any
    ): { [key: string]: [number, number][] }[][] => {
        const slicedData: { [key: string]: [number, number][] }[][] = []

        for (const labels of this.order) {
            const columns = labels.length
            const temp: Record<any, any>[] = []
            let count = 0
            for (const label of labels) {
                const channel = channels[label] || []
                const step = channel.length / columns
                const slice = channel.slice(count * step, (count + 1) * step)
                temp.push({ [label]: this.transformToCoordinate(slice) })
                count++
            }
            slicedData.push(temp)
        }
        return slicedData
    }

    plot = () => {

        const grid = [6, 12.5]

        const lineColor = "#000000"
        const lineWidth = 0.75
        const minorGridColor = "#ffbfc0"
        const majorGridColor = "#ff7f7f"
        const minorGridWidth = 0.5
        const majorGridWidth = 0.5
        const textColor = "#000000"
        const textSize = "0.75em"
        const textFont = "sans-serif"


        const numberOfSquaresVertically = grid[0]
        const numberOfSquaresHorizontal = grid[1]


        const DPI = 96
        const height = (numberOfSquaresVertically * 5 * DPI) / 25.4
        const width = (numberOfSquaresHorizontal * 4 * 5 * DPI) / 25.4 / 4


        const duration = (
            Object.values(this.channels?.[0]?.[0] || {})?.[0] as any
        )?.length

        const svg = d3.create("svg")

        svg.attr("width", width * 4)
            .attr("height", height * this.order.length)
            .attr("preserveAspectRatio", "xMinYMin")
            .attr("shape-rendering", "crispEdges")
            .style("fill", "none")

        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")

        const xScale = d3
            .scaleLinear()
            .range([0, width * 4])
            .domain([0, duration * 4])
            .clamp(false)

        const yScale = d3
            .scaleLinear()
            .range([height, 0])
            .domain([-300, 300])
            .clamp(false)

        const xMajorGrid = d3
            .axisTop(xScale)
            .ticks(numberOfSquaresHorizontal * 4)
            .tickSize(-height)
            .offset(0)
            .tickFormat(() => "")

        const xMinorGrid = d3
            .axisTop(xScale)
            .ticks(numberOfSquaresHorizontal * 4 * 5)
            .tickSize(-height)
            .offset(0)
            .tickFormat(() => "")

        const yMajorGrid = d3
            .axisLeft(yScale)
            .ticks(numberOfSquaresVertically)
            .tickSize(-width * 4)
            .offset(0)
            .tickFormat(() => "")

        const yMinorGrid = d3
            .axisLeft(yScale)
            .ticks(numberOfSquaresVertically * 5)
            .tickSize(-width * 4)
            .offset(0)
            .tickFormat(() => "")


        const line = d3
            .line()
            .x((d: [number, number]) => xScale(d[0]))
            .y((d: [number, number]) => yScale(d[1]))

        for (let channel = 0; channel < this.order.length; channel++) {
            svg.append("g")
                .style("color", minorGridColor)
                .style("stroke-width", minorGridWidth)
                .attr("transform", `translate(0, ${height * channel})`)
                .call(xMinorGrid)

            svg.append("g")
                .style("color", minorGridColor)
                .style("stroke-width", minorGridWidth)
                .attr("transform", `translate(0, ${height * channel})`)
                .call(yMinorGrid)

            svg.append("g")
                .style("color", majorGridColor)
                .style("stroke-width", majorGridWidth)
                .attr("transform", `translate(0, ${height * channel})`)
                .call(xMajorGrid)

            svg.append("g")
                .style("color", majorGridColor)
                .style("stroke-width", majorGridWidth)
                .attr("transform", `translate(0, ${height * channel})`)
                .call(yMajorGrid)

            for (let label = 0; label < this.order[channel].length; label++) {
                const slice = (width * 4) / this.order[channel].length

                svg.append("path")
                    .attr(
                        "d",
                        line(
                            this.channels[channel][label][
                            this.order[channel][label]
                            ]
                        )
                    )
                    .attr(
                        "transform",
                        `translate(${slice * label}, ${height * channel})`
                    )
                    .style("stroke", lineColor)
                    .style("stroke-width", lineWidth)
                    .attr("shape-rendering", "geometricPrecision")
                    .attr("stroke-linejoin", "round")
                    .append("title")
                    .text(this.order[channel][label])

                svg.append("text")
                    .attr("x", slice * label)
                    .attr("y", height / 2 + height * channel + 19)
                    .attr("font-size", textSize)
                    .attr("font-family", textFont)
                    .attr("fill", textColor)
                    .text(this.order[channel][label])
            }
        }

        return svg.node()
    }
}
export default ECG

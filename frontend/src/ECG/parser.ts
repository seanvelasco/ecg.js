// const order = []

// const transformToCoordinate = (dataset: number[]): [number, number][] => {
//     return dataset.map((y, x) => [x, y])
// }

// const parse = (xmlString: string, parser: Function) => {

//     const xmlParser = new DOMParser()

//     const xmlDoc = xmlParser.parseFromString(xmlString, "text/xml")

//     if (xmlString.includes('SierraECG')) {
//         // channels = parser(xmlDoc)
//     }
// }

// const groupData = (channels: any): { [key: string]: [number, number][] }[][] => {

//     const slicedData: { [key: string]: [number, number][] }[][] = []

//     for (const labels of order) {
//         const columns = labels.length
//         const temp = []
//         let count = 0
//         for (const label of labels) {
//             const channel = channels[label] || []
//             const step = channel.length / columns
//             const slice = channel.slice(count * step, (count + 1) * step)
//             temp.push({ [label]: transformToCoordinate(slice) })
//             count++
//         }
//         slicedData.push(temp)
//     }
//     return slicedData
// }
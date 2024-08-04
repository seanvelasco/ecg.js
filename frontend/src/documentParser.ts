
// Remove dependency to external XML parser

const documentParser = (xmlString: string, parser: any) => {

    const xmlParser = new DOMParser()

    const xmlDoc = xmlParser.parseFromString(xmlString, "text/xml")

    // let barcode
    let channels

    if (xmlString.includes('SierraECG')) {
        channels = parser(xmlDoc)
    }

    return {
        barcode: '',
        channels
    }
}

export {
    documentParser
}
import { convertMicroToMilli } from '../../../utils'

const parser = (xmlDoc: XMLDocument) => {

    const mdc = {
        MDC_ECG_LEAD_I: "I",
        MDC_ECG_LEAD_II: "II",
        MDC_ECG_LEAD_III: "III",
        MDC_ECG_LEAD_AVR: "AVR",
        MDC_ECG_LEAD_AVL: "AVL",
        MDC_ECG_LEAD_AVF: "AVF",
        MDC_ECG_LEAD_V1: "V1",
        MDC_ECG_LEAD_V2: "V2",
        MDC_ECG_LEAD_V3: "V3",
        MDC_ECG_LEAD_V4: "V4",
        MDC_ECG_LEAD_V5: "V5",
        MDC_ECG_LEAD_V6: "V6",
    }

    const values: Record<string, number[]> = {}

    const waveformData = xmlDoc.getElementsByTagName('sequence')

    for (const waveform of waveformData) {
        const [code] = waveform.getElementsByTagName("code")
        const [value] = waveform.getElementsByTagName("value")

        const lead = code.getAttribute("code") as keyof typeof mdc

        if (value.textContent?.trim() && lead) {
            const dataPoints = value.textContent.trim().split(" ").map(convertMicroToMilli)
            console.log(dataPoints)
            values[mdc[lead]] = dataPoints
        }
    }
    return values
}

export default parser
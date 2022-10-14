import xml2js from 'xml2js'

interface electrocardiogramData {
    barcode: string
    channels: { [key: string]: number[] }
}


// This function is due for a refactor
// Remove dependency to external XML parser

const documentParser = (xml: string | Buffer): electrocardiogramData => {
    let xmlOjbect: any

    xml2js.parseString(xml.toString(), (error, document) => {
        if (error) {
            throw error

        }
        xmlOjbect = document
    })

    let barcode
    let channels: { [key: string]: number[] } | any = {}

    const GE = () => {
        const name = xmlOjbect?.sapphire?.dcarRecord[0]?.patientInfo[0]?.name[0]

        const { given, family } = name
    
        barcode = xmlOjbect?.sapphire?.dcarRecord[0]?.patientInfo[0]?.identifier[0]?.id[0]?.$?.V || family
    
        const waveforms = xmlOjbect?.sapphire?.dcarRecord[0]?.patientInfo[0]?.visit[0]?.order[0]?.ecgResting[0]?.params[0]?.ecg[0]?.wav[0]?.ecgWaveformMXG[0]?.ecgWaveform
    
        waveforms.map((waveform: { [key: string]: { [key: string]: string } }) => {
            const { lead, asizeVT, VT, label, V }: { [key: string]: string } = waveform.$
            // Convert sequence of data points encapsulated in a single string into an array of numbers
            const dataPoints = V.split(' ').map((v: string) => parseFloat(v))
            channels[lead] = dataPoints
        })
    }
    
    const Mindray = () => {
        const waveforms = xmlOjbect?.AnnotatedECG?.component[0]?.series[0]?.component[0]?.sequenceSet[0]?.component

        barcode = xmlOjbect?.AnnotatedECG?.componentOf[0]?.timepointEvent[0]?.componentOf[0]?.subjectAssignment[0]?.subject[0]?.trialSubject[0]?.subjectDemographicPerson[0]?.PatientID[0] ?? 'NO_BARCODE'
        
        waveforms.map((waveform: any) => {
            const { code, value } = waveform?.sequence[0]
            const label = code[0]?.$?.code ?? ''
            const dataPointsString = value[0]?.digits

            const leadDictionary = {
                MDC_ECG_LEAD_I: 'I',
                MDC_ECG_LEAD_II: 'II',
                MDC_ECG_LEAD_III: 'III',
                MDC_ECG_LEAD_AVR: 'AVR',
                MDC_ECG_LEAD_AVL: 'AVL',
                MDC_ECG_LEAD_AVF: 'AVF',
                MDC_ECG_LEAD_V1: 'V1',
                MDC_ECG_LEAD_V2: 'V2',
                MDC_ECG_LEAD_V3: 'V3',
                MDC_ECG_LEAD_V4: 'V4',
                MDC_ECG_LEAD_V5: 'V5',
                MDC_ECG_LEAD_V6: 'V6',
                '': ''
            }

            // check size of dataPointsString
            if (dataPointsString) {
                const dataPoints = dataPointsString[0].split(' ').map((v: string) => parseFloat(v))
                channels[leadDictionary[label]] = dataPoints
            }

        })


        

    }

    Mindray()

    return { barcode, channels }
}

export {
    documentParser
}
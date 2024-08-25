import xml2js from 'xml2js'

// Remove dependency to external XML parser

const documentParser = (xml: string | Buffer): any => {
    const xmlString = xml.toString()
    let xmlOjbect: any

    xml2js.parseString(xmlString, (error, document) => {
        if (error) {
            throw error
        }
        xmlOjbect = document
    })

    let barcode
    let channels: { [key: string]: number[] } | any = {}

    const measurements = {}

    const GE = () => {

        barcode = xmlOjbect?.sapphire?.dcarRecord?.[0]?.patientInfo?.[0]?.identifier?.[0]?.id?.[0]?.$?.V ?? ''

        const waveforms = xmlOjbect?.sapphire?.dcarRecord?.[0]?.patientInfo?.[0]?.visit?.[0]?.order?.[0]?.ecgResting?.[0]?.params?.[0]?.ecg?.[0]?.wav?.[0]?.ecgWaveformMXG?.[0]?.ecgWaveform

        const numericalValues = xmlOjbect?.sapphire?.dcarRecord?.[0]?.patientInfo?.[0]?.visit?.[0]?.order?.[0]?.ecgResting?.[0]?.params?.[0]?.ecg?.[0]?.num?.[0]

        const measurementValues = xmlOjbect?.sapphire?.dcarRecord?.[0]?.patientInfo?.[0]?.visit?.[0]?.order?.[0]?.ecgResting?.[0]?.params?.[0]?.ecg?.[0]?.var?.[0]?.medianTemplate[0]?.measurements[0]?.global[0]

        for (const numericalValue in measurementValues) {

            const { V, U, INV } = measurementValues[numericalValue][0].$

            measurements[numericalValue] = V

        }

        for (const numericalValue in numericalValues) {

            const { V, U, INV } = numericalValues[numericalValue][0].$

            measurements[numericalValue] = V
        }

        waveforms.map((waveform: { [key: string]: { [key: string]: string } }) => {
            const { lead, asizeVT, VT, label, V }: { [key: string]: string } = waveform.$
            let dataPoints: any = V.split(' ').map((v: string) => parseFloat(v))

            channels[lead] = dataPoints
        })
    }

    const HL7_FDA = () => {
        const waveforms = xmlOjbect?.AnnotatedECG?.component?.[0]?.series?.[0]?.component?.[0]?.sequenceSet?

        barcode = xmlOjbect?.AnnotatedECG?.componentOf?.[0]?.timepointEvent?.[0]?.componentOf?.[0]?.subjectAssignment?.[0]?.subject?.[0]?.trialSubject?.[0]?.subjectDemographicPerson?.[0]?.PatientID?.[0] ?? 'NO_BARCODE'

        waveforms.map((waveform: any) => {
            const { code, value } = waveform?.sequence?.[0]
            const label = code?.[0]?.$?.code ?? ''
            const dataPointsString = value?.[0]?.digits

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
                const dataPoints = dataPointsString?.[0].split(' ').map((v: string) => parseFloat(v))
                channels[leadDictionary[label]] = dataPoints
            }
        })
    }

    let hehehe

    const Philips = () => {

        const waveformData = xmlOjbect.restingecgdata.waveforms[0].parsedwaveforms[0]._

        const buf = Buffer.from(waveformData, 'base64')

        class Code {
            code: number
            value: string[]

            constructor(code: number, value: string | string[]) {
                this.code = code

                if (Array.isArray(value)) {
                    this.value = value.slice()
                } else {
                    this.value = [value]
                }
            }

            append(output: string[]): string[] {
                for (const index in this.value) {
                    output.push(this.value[index])
                }
                return output
            }
        }

        class LZW {
            offset = 0
            bits = 10 || 16
            maxCode = (1 << this.bits) - 2
            chunkSize = Math.floor((8 * 1024) / this.bits)
            bitCount = 0
            buffer = 0
            previous: string[] = []
            nextCode = 256
            strings: { [key: string]: Code } = {}
            data: Buffer
            output = []
            codesRead = 0
            goingNext = false

            constructor(data: Buffer) {
                this.data = data
                for (let i = 0; i < this.nextCode; ++i) {
                    this.strings[i] = new Code(i, String(i))
                }
            }

            private readCode() {
                let EOF = false

                while (this.bitCount <= 24) {
                    if (this.offset >= this.data.length) {
                        EOF = true
                        break
                    }
                    const next = this.data[this.offset++]
                    this.buffer |= ((next & 0xff) << (24 - this.bitCount)) & 0xffffffff
                    this.bitCount += 8
                }

                if (EOF && this.bitCount < this.bits) {
                    return -1
                }

                const code = (this.buffer >>> (32 - this.bits)) & 0x0000ffff
                this.buffer = ((this.buffer & 0xffffffff) << this.bits) & 0xffffffff
                this.bitCount = this.bitCount - this.bits
                return code
            }

            decode() {
                let code: number
                let value: string[]
                let output = [] // Types not agreeing
                let decoding = true

                // Due for a rafactor/re-write
                // Prone to an infinite loop

                // Script below needs to exit after x exceeds y
                // However, the loop is never exited
                // But waits until code > maxCode is reached
                // Contributes 500ms scripting time at most

                while (decoding === true) {
                    const condition = true
                    while (condition) {
                        code = this.readCode()
                        if (code > this.maxCode) {
                            decoding = false
                            break
                        }
                        if (!Object.prototype.hasOwnProperty.call(this.strings, code)) {
                            value = this.previous.slice()
                            value.push(this.previous[0])
                            this.strings[code] = new Code(code, value)
                        }

                        output = this.strings[code].append(output)

                        if (this.previous.length > 0 && this.nextCode <= this.maxCode) {
                            value = this.previous.slice()
                            value.push(this.strings[code].value[0])
                            const nc = this.nextCode++
                            this.strings[nc] = new Code(nc, value)
                        }
                        this.previous = this.strings[code].value
                    }
                }
                return Buffer.from(output) // Types not agreeing
            }
        }

        class XLI {
            offset = 0
            input: Buffer

            constructor(input: Buffer) {
                this.input = input
            }

            private decodeDeltas(deltas: number[], lastValue: number): number[] {
                const values = deltas.slice()
                let x = values[0]
                let y = values[1]
                for (let i = 2; i < values.length; i++) {
                    const z = y * 2 - x - lastValue
                    lastValue = values[i] - 64
                    values[i] = z
                    x = y
                    y = z
                }
                return values
            }

            private unpack(data: Buffer): number[] {
                const unpacked = new Array(Math.floor(data.length / 2))

                for (let i = 0; i < unpacked.length; i++) {
                    unpacked[i] = (((data[i] << 8) | data[i + unpacked.length]) << 16) >> 16
                }
                return unpacked
            }

            private readChunk() {
                const header = this.input.slice(this.offset + 0, this.offset + 8)
                const size = header.readInt32LE(0) // chuck size
                // const code = header.readInt16LE(4)
                const delta = header.readInt16LE(6)
                const compressedBlock = this.input.slice(this.offset + 8, this.offset + 8 + size)
                const reader = new LZW(compressedBlock)
                const syncdecode = reader.decode()
                const unpacked = this.unpack(syncdecode)
                const values = this.decodeDeltas(unpacked, delta)
                return { size: header.length + compressedBlock.length, values }
            }
            decode() {
                const leads: number[][] = []

                while (this.offset < this.input.length) {
                    const chunk = this.readChunk()
                    leads.push(chunk.values)
                    this.offset += chunk.size
                }
                return leads
            }
        }

        const reconstitude = (series: number[][]) => {
            const leadI = series[0]
            const leadII = series[1]
            const leadIII = series[2]
            const leadAVR = series[3]
            const leadAVL = series[4]
            const leadAVF = series[5]

            for (const index in leadIII) {
                leadIII[index] = leadII[index] - leadI[index] - leadIII[index]
            }

            for (const index in leadAVR) {
                leadAVR[index] = -leadAVR[index] - ((leadI[index] + leadII[index]) / 2)
            }

            for (const index in leadAVL) {
                leadAVL[index] = (leadI[index] - leadIII[index]) / 2 - leadAVL[index]
            }

            for (const index in leadAVF) {
                leadAVF[index] = (leadII[index] + leadIII[index]) / 2 - leadAVF[index]
            }

            return series
        }

        const decompressedWaveform = new XLI(buf).decode()

        const reconstitutedWaveform = reconstitude(decompressedWaveform)

        const I = reconstitutedWaveform[0]
        const II = reconstitutedWaveform[1]
        const III = reconstitutedWaveform[2]
        const AVR = reconstitutedWaveform[3]
        const AVL = reconstitutedWaveform[4]
        const AVF = reconstitutedWaveform[5]
        const V1 = reconstitutedWaveform[6]
        const V2 = reconstitutedWaveform[7]
        const V3 = reconstitutedWaveform[8]
        const V4 = reconstitutedWaveform[9]
        const V5 = reconstitutedWaveform[10]
        const V6 = reconstitutedWaveform[11]
        console.log(V3)
        channels = {
            I,
            II,
            III,
            AVR,
            AVL,
            AVF,
            V1,
            V2,
            V3,
            V4,
            V5,
            V6
        }
    }

    if (xmlString.includes('MAC800')) GE()
    if (xmlString.includes('urn:hl7-org:v3')) HL7_FDA()
    if (xmlString.includes('Philips')) Philips()
    return { barcode, channels, measurements }
}

export {
    documentParser
}

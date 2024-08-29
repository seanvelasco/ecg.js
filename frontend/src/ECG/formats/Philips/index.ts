import { convertToUnknwon } from "../../../utils"

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
    strings: { [key: string]: Code } | any = {}
    data: Uint8Array
    output = []
    codesRead = 0
    goingNext = false

    constructor(data: Uint8Array) {
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
        let output: number[] = []
        let decoding = true


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
        return new Uint8Array(output)
    }
}

export class XLI {
    offset = 0
    input: Uint8Array

    constructor(input: Uint8Array) {
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

    private unpack(data: Uint8Array): number[] {
        const unpacked = new Array(Math.floor(data.length / 2))

        for (let i = 0; i < unpacked.length; i++) {
            unpacked[i] = (((data[i] << 8) | data[i + unpacked.length]) << 16) >> 16
        }
        return unpacked
    }

    private readChunk() {
        const header = this.input.slice(this.offset + 0, this.offset + 8)
        const size = new DataView(header.buffer).getInt32(0, true)
        const delta = new DataView(header.buffer).getInt16(6, true)
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

const reconstitute = (series: number[][]) => {
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

const parser = (xmlDoc: XMLDocument) => {

    const waveformData = xmlDoc.getElementsByTagName('parsedwaveforms')[0].childNodes[0].nodeValue as string

    const buf = Uint8Array.from(atob(waveformData), char => char.charCodeAt(0))

    const decompressedWaveform = new XLI(buf).decode()

    const reconstitutedWaveform = reconstitute(decompressedWaveform)

    for (const lead in reconstitutedWaveform) {
        console.log(reconstitutedWaveform[lead])
        reconstitutedWaveform[lead] = reconstitutedWaveform[lead].map(convertToUnknwon)
    }

    return {
        I: reconstitutedWaveform[0],
        II: reconstitutedWaveform[1],
        III: reconstitutedWaveform[2],
        AVR: reconstitutedWaveform[3],
        AVL: reconstitutedWaveform[4],
        AVF: reconstitutedWaveform[5],
        V1: reconstitutedWaveform[6],
        V2: reconstitutedWaveform[7],
        V3: reconstitutedWaveform[8],
        V4: reconstitutedWaveform[9],
        V5: reconstitutedWaveform[10],
        V6: reconstitutedWaveform[11]
    }
}

export default parser
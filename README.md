# @seanvelasco/ecg

## Installation

```bash
npm install @seanvelasco/ecg
```

## Usage

```typescript
import ECG from "@seanvelasco/ecg"
import fs from 'fs'

// Path to ECG XML file
// See supported XML formats below
const file = fs.readFileSync("path/to/ecg.xml")

const ecg = new ECG(file.toString())

const svgImage = await ecg.plot('svg')

const jpegImage = await ecg.plot('jpeg')
```

### Supported XML formats

- Philips XML
- Mindray MR XML
- GE MUSE XML
- HL7 FDA

### Supported elecrocardiograms

- Philips PageWriter series
- Mindray BeneHeart series
- GE MAC series
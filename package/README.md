# @seanvelasco/ecg

## Installation

```bash
npm install @seanvelasco/ecg
```

## Usage

```typescript
import ECG from "@seanvelasco/ecg"
import fs from 'fs'

const xmlFile = fs.readFileSync("ecg.xml")

const ecg = new ECG(xmlFile)

const image = ecg.plot()

fs.writeFileSync("image.svg", image)

```


## Parsing different XML formats

- Philips XML
- Mindray MR XML
- GE MUSE XML
- HL7 FDA

## Preparing the data

- reconstitute

- normalize

- downsample

## Plotting the data
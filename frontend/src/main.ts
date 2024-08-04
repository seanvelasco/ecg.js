import ECG from "./ecg"

let ecgSVG: SVGElement | undefined

const handleOpen = (event: Event) => {
	const eventTarget = event.target as HTMLInputElement
	if (eventTarget.files) {
		const [file] = eventTarget.files
		const reader = new FileReader()
		reader.readAsText(file)
		reader.onload = async (event) => {
			const eventTarget = event.target as FileReader
			const content = eventTarget.result as string
			await drawECG(content)
		}
	}
}

const handleLoadSample = async () => {
	console.log("handleLoadSample")
	const response = await fetch("/129DYPRG.XML")
	const content = await response.text()
	await drawECG(content)
}

const handlePrint = () => {
	if (!ecgSVG) return
	const printWindow = window.open("", "_blank") as Window
	printWindow.document.write("<html><head><title>ECG</title></head><body>")
	printWindow.document.write(` <style>
        @page {
          size: landscape;
          margin: 1.5rem;
        }
        body {
          margin: 0;
        }
        svg {
          page-break-inside: avoid;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          svg {
            image-resolution: 300dpi;
          }
        }
      </style>`)
	printWindow.document.write(ecgSVG.outerHTML)
	printWindow.document.write("</body></html>")
	printWindow.document.close()
	printWindow.print()
}

const handleDownload = () => {
	if (!ecgSVG) return
	const blob = new Blob([ecgSVG.outerHTML], { type: 'image/svg' });

	const url = window.URL.createObjectURL(blob)

	const a = document.createElement('a')

	a.href = url
	a.download = 'downloaded_text.svg'

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	window.URL.revokeObjectURL(url);
}

const drawECG = async (content: string) => {
	const ecg = new ECG(content)
	const img = await ecg.plot()
	if (img) {
		ecgSVG = img
		const element = document.getElementById("ecg") as HTMLDivElement
		element.innerHTML = "" // No use-case for comparing multiple ECGs
		element.append(img)
		toggleButtonStates(true)
	}
}

const toggleButtonStates = (contentAvailable: boolean) => {
	const exportButton = document.getElementById("export") as HTMLButtonElement
	const printButton = document.getElementById("print") as HTMLButtonElement
	const selects = document.querySelectorAll("select")
	exportButton.disabled = !contentAvailable
	printButton.disabled = !contentAvailable
	for (const select of selects) { select.disabled = !contentAvailable }
}

const init = () => {
	const fileSelector = document.getElementById("upload") as HTMLInputElement
	const sampleButton = document.getElementById("sample") as HTMLButtonElement
	const exportButton = document.getElementById("export") as HTMLButtonElement
	const printButton = document.getElementById("print") as HTMLButtonElement
	toggleButtonStates(false)
	fileSelector.addEventListener("change", handleOpen)
	sampleButton.addEventListener("click", handleLoadSample)
	exportButton.addEventListener("click", handleDownload)
	printButton.addEventListener("click", handlePrint)
}

window.onload = init

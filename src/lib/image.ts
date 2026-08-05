const OUTPUT_MAX_SIZE = 512

const OUTPUT_TYPE = "image/jpeg"
const OUTPUT_QUALITY = 0.9

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", () =>
      reject(new Error("Não foi possível ler a imagem."))
    )
    image.src = src
  })
}

function toJpegName(filename: string): string {
  const dot = filename.lastIndexOf(".")
  const base = dot > 0 ? filename.slice(0, dot) : filename

  return `${base || "avatar"}.jpg`
}

export async function cropImageToFile(
  src: string,
  area: CropArea,
  filename: string
): Promise<File> {
  const image = await loadImage(src)

  const size = Math.max(1, Math.min(OUTPUT_MAX_SIZE, Math.round(area.width)))

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Não foi possível preparar a imagem.")
  }

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    size,
    size
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY)
  })

  if (!blob) {
    throw new Error("Não foi possível gerar a imagem recortada.")
  }

  return new File([blob], toJpegName(filename), { type: OUTPUT_TYPE })
}

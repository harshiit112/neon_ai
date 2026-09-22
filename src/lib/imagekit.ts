import ImageKit from '@imagekit/nodejs'

export const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
})

export async function uploadImageFromUrl(
  url: string,
  fileName: string,
  folder = 'slides',
): Promise<string> {
  const result = await imagekit.files.upload({
    file: url,
    fileName,
    folder,
    useUniqueFileName: true,
  })
  if (!result.url) {
    throw new Error('ImageKit upload did not return a URL')
  }
  return result.url
}
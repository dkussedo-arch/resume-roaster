import {
  createServiceClient,
  getStorageBucket,
  isSupabaseConfigured,
  sanitizeFilename,
} from '@/lib/storage'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export async function POST(request: Request): Promise<Response> {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Expected multipart form data.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'A PDF file is required.' }, { status: 400 })
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return Response.json({ error: 'Only PDF files are supported.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Response.json(
      { error: 'File is too large. Maximum size is 10 MB.' },
      { status: 400 }
    )
  }

  const fileSizeKb = Math.round(file.size / 1024)

  if (!isSupabaseConfigured()) {
    return Response.json({
      filename: file.name,
      fileSizeKb,
      storagePath: null,
      storageUploaded: false,
      storageSkipped: true,
      message:
        'Supabase is not configured — PDF was not stored. Text extraction still works on the client.',
    })
  }

  try {
    const supabase = createServiceClient()
    const bucket = getStorageBucket()
    const safeName = sanitizeFilename(file.name || 'resume.pdf')
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

    if (error) {
      console.error('[Resume Roaster] Storage upload failed:', error.message)
      return Response.json(
        {
          error: `Storage upload failed: ${error.message}`,
          filename: file.name,
          fileSizeKb,
          storageUploaded: false,
        },
        { status: 502 }
      )
    }

    return Response.json({
      filename: file.name,
      fileSizeKb,
      storagePath: path,
      storageUploaded: true,
      storageSkipped: false,
      bucket,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.'
    console.error('[Resume Roaster] Upload error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}

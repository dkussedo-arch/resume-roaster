import {
  guardApiRequest,
  internalErrorResponse,
} from '@/lib/api-guard'
import {
  createServiceClient,
  getStorageBucket,
  isSupabaseConfigured,
  sanitizeFilename,
} from '@/lib/storage'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function detectKind(file: File): 'pdf' | 'docx' | 'txt' | null {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf'
  }
  if (file.type === DOCX_MIME || name.endsWith('.docx')) {
    return 'docx'
  }
  if (file.type === 'text/plain' || name.endsWith('.txt')) {
    return 'txt'
  }
  return null
}

export async function POST(request: Request): Promise<Response> {
  const blocked = guardApiRequest(request)
  if (blocked) {
    return blocked
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Expected multipart form data.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'A resume file is required.' }, { status: 400 })
  }

  const kind = detectKind(file)
  if (!kind) {
    return Response.json(
      { error: 'Only PDF, DOCX, and TXT files are supported.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Response.json(
      { error: 'File is too large. Maximum size is 10 MB.' },
      { status: 400 }
    )
  }

  const fileSizeKb = Math.round(file.size / 1024)
  const contentType =
    kind === 'pdf'
      ? 'application/pdf'
      : kind === 'docx'
        ? DOCX_MIME
        : 'text/plain'

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({
      filename: file.name,
      fileSizeKb,
      kind,
      storagePath: null,
      storageUploaded: false,
      storageSkipped: true,
      message:
        'Supabase storage is not fully configured (needs URL + SUPABASE_SERVICE_ROLE_KEY). Text extraction still works on the client.',
    })
  }

  try {
    const supabase = createServiceClient()
    const bucket = getStorageBucket()
    const safeName = sanitizeFilename(
      file.name ||
        (kind === 'pdf'
          ? 'resume.pdf'
          : kind === 'docx'
            ? 'resume.docx'
            : 'resume.txt')
    )
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: false,
    })

    if (error) {
      console.error('[Resume Roaster] Storage upload failed:', error.message)
      return Response.json(
        {
          error: 'Storage upload failed. Please try again.',
          filename: file.name,
          fileSizeKb,
          kind,
          storageUploaded: false,
        },
        { status: 502 }
      )
    }

    return Response.json({
      filename: file.name,
      fileSizeKb,
      kind,
      storagePath: path,
      storageUploaded: true,
      storageSkipped: false,
      bucket,
    })
  } catch (error) {
    return internalErrorResponse(
      'Upload error',
      error,
      'Failed to upload resume. Please try again.'
    )
  }
}

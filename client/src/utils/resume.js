export const RESUME_MAX_SIZE = 4 * 1024 * 1024
export const RESUME_ACCEPT = '.pdf,.doc,.docx'

const RESUME_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const RESUME_EXTENSION_RE = /\.(pdf|doc|docx)$/i

const isAllowedResumeFile = (file) => RESUME_MIME_TYPES.has(file.type) || RESUME_EXTENSION_RE.test(file.name)

export const validateResumeFile = (file) => {
  if (!isAllowedResumeFile(file)) return 'Upload a PDF, DOC or DOCX file.'
  if (file.size > RESUME_MAX_SIZE) return 'Keep your resume under 4MB.'
  return null
}

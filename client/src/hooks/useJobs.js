import { useEffect, useState } from 'react'
import axios from 'axios'
import { getJobs } from '../services/jobService'
import { parseApiError } from '../utils/apiError'

export function useJobs(params) {
  const key = JSON.stringify(params)
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${key}#${attempt}`
  const [result, setResult] = useState({ requestKey: null, status: 'loading', jobs: [], pagination: null, error: '' })

  useEffect(() => {
    const controller = new AbortController()

    getJobs(JSON.parse(key), { signal: controller.signal })
      .then(({ jobs, pagination }) => setResult({ requestKey, status: 'success', jobs, pagination, error: '' }))
      .catch((error) => {
        if (axios.isCancel(error)) return
        setResult({ requestKey, status: 'error', jobs: [], pagination: null, error: parseApiError(error).message })
      })

    return () => controller.abort()
  }, [key, requestKey])

  const isCurrent = result.requestKey === requestKey
  return {
    status: isCurrent ? result.status : 'loading',
    jobs: isCurrent ? result.jobs : [],
    pagination: isCurrent ? result.pagination : null,
    error: isCurrent ? result.error : '',
    retry: () => setAttempt((count) => count + 1),
  }
}

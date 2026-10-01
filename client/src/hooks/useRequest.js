import { useEffect, useState } from 'react'
import axios from 'axios'
import { parseApiError } from '../utils/apiError'

export function useRequest(fetcher, key, { enabled = true } = {}) {
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${key}#${attempt}`
  const [result, setResult] = useState({ requestKey: null, status: 'loading', data: null, error: '', errorStatus: null })

  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()

    fetcher(controller.signal)
      .then((data) => setResult({ requestKey, status: 'success', data, error: '', errorStatus: null }))
      .catch((error) => {
        if (axios.isCancel(error)) return
        const { message, status } = parseApiError(error)
        setResult({ requestKey, status: 'error', data: null, error: message, errorStatus: status ?? null })
      })

    return () => controller.abort()
  }, [requestKey, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const isCurrent = result.requestKey === requestKey
  return {
    status: !enabled ? 'idle' : isCurrent ? result.status : 'loading',
    data: enabled && isCurrent ? result.data : null,
    error: isCurrent ? result.error : '',
    errorStatus: isCurrent ? result.errorStatus : null,
    retry: () => setAttempt((count) => count + 1),
    setData: (data) => setResult({ requestKey, status: 'success', data, error: '', errorStatus: null }),
  }
}

export const APPLICATION_STATUS_INFO = {
  pending: { label: 'Pending review', tone: 'neutral', text: 'Your application is waiting for the recruiter to review it.' },
  reviewed: { label: 'Reviewed', tone: 'brand', text: 'The recruiter has looked at your application.' },
  shortlisted: { label: 'Shortlisted', tone: 'brand', text: 'Good news: you have been shortlisted for this role.' },
  interview: { label: 'Interview', tone: 'warning', text: 'You have been invited to interview for this role.' },
  hired: { label: 'Hired', tone: 'success', text: 'Congratulations! You were selected for this role.' },
  rejected: { label: 'Not selected', tone: 'danger', text: 'The recruiter decided not to move forward with your application.' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral', text: 'You withdrew this application.' },
}

export const getStatusInfo = (status) =>
  APPLICATION_STATUS_INFO[status] ?? { label: status, tone: 'neutral', text: '' }

const WITHDRAWABLE = ['pending', 'reviewed', 'shortlisted', 'interview']
export const canWithdraw = (status) => WITHDRAWABLE.includes(status)

export const APPLICATION_TRANSITIONS = {
  pending: ['reviewed', 'shortlisted', 'interview', 'rejected'],
  reviewed: ['shortlisted', 'interview', 'rejected'],
  shortlisted: ['interview', 'hired', 'rejected'],
  interview: ['hired', 'rejected'],
}
export const nextStatuses = (status) => APPLICATION_TRANSITIONS[status] ?? []

export const FINAL_DECISIONS = ['hired', 'rejected']

export const getRecruiterStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1)

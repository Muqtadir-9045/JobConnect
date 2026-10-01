import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { PATHS } from '../routes/paths'

export default function NotFoundPage() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-4xl font-bold">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-slate-600">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button to={PATHS.home}>Go home</Button>
        <Button to={PATHS.jobs} variant="secondary">
          Browse jobs
        </Button>
      </div>
    </Container>
  )
}

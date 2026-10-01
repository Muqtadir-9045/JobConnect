import Container from './Container'

export default function PageHeader({ title, description, actions, children }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <Container className="py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-base text-slate-600">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </Container>
    </div>
  )
}

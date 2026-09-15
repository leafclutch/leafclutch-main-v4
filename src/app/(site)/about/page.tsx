export const metadata = { title: 'About Us' }

export default function AboutPage() {
  return <Placeholder title="About Us" />
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">Page coming soon</p>
      </div>
    </div>
  )
}
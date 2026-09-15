export const metadata = { title: 'Training' }

export default function TrainingPage() {
  return <Placeholder title="Training & Internship" />
}

function Placeholder({ title }: { title: string }) {
  return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><h1 className="text-3xl font-bold text-foreground">{title}</h1></div>
}
export const metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <Placeholder title="Please visit Our social media for the latest job openings." />
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
    </div>
  );
}

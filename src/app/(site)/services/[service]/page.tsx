import ManagedServicePage from '@/features/services/ManagedServicePage';

export default async function ManagedServiceRoute({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  return <ManagedServicePage serviceId={service} />;
}

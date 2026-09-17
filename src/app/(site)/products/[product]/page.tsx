import ManagedServicePage from '@/features/services/ManagedServicePage';

export default async function ProductRoute({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  return <ManagedServicePage serviceId={product} />;
}

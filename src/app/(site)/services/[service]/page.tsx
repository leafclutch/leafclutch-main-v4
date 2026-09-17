import ServiceSlugRouter from '@/features/services/ServiceSlugRouter';

export default async function ServiceRoute({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  return <ServiceSlugRouter slug={service} />;
}

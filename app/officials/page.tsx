import { getEntities, getTags } from '@/lib/queries';
import { OfficialsClient } from '@/components/OfficialsClient';

export const revalidate = 60;

export default async function OfficialsPage() {
  const [entities, tags] = await Promise.all([getEntities(), getTags()]);
  return <OfficialsClient entities={entities} tags={tags} />;
}

import { getPolicies, getTags } from '@/lib/queries';
import { HomeClient } from '@/components/HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const [policies, tags] = await Promise.all([getPolicies(), getTags()]);
  return <HomeClient policies={policies} tags={tags} />;
}

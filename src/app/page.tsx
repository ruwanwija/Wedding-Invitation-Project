import { 
  getSettings, 
  getTimeline, 
  getProgram, 
  getGallery, 
  getWishes,
  getGuestByToken
} from '@/lib/db';
import WeddingClientApp from '@/components/WeddingClientApp';

// Force dynamic rendering to ensure that guest wishes and settings modifications 
// update in real-time in production without requiring a project rebuild.
export const dynamic = 'force-dynamic';

export default async function Home(props: { searchParams: Promise<{ guest?: string }> }) {
  const searchParams = await props.searchParams;
  const guestToken = typeof searchParams.guest === 'string' ? searchParams.guest : undefined;

  // Fetch initial datasets in parallel on the server
  const [settings, timeline, program, gallery, wishes, guest] = await Promise.all([
    getSettings(),
    getTimeline(),
    getProgram(),
    getGallery(),
    getWishes(),
    guestToken ? getGuestByToken(guestToken) : null
  ]);

  return (
    <WeddingClientApp
      initialSettings={settings}
      initialTimeline={timeline}
      initialProgram={program}
      initialGallery={gallery}
      initialWishes={wishes}
      guest={guest}
    />
  );
}

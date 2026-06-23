import { 
  getSettings, 
  getTimeline, 
  getProgram, 
  getGallery, 
  getWishes 
} from '@/lib/db';
import WeddingClientApp from '@/components/WeddingClientApp';

// Force dynamic rendering to ensure that guest wishes and settings modifications 
// update in real-time in production without requiring a project rebuild.
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch initial datasets in parallel on the server
  const [settings, timeline, program, gallery, wishes] = await Promise.all([
    getSettings(),
    getTimeline(),
    getProgram(),
    getGallery(),
    getWishes()
  ]);

  return (
    <WeddingClientApp
      initialSettings={settings}
      initialTimeline={timeline}
      initialProgram={program}
      initialGallery={gallery}
      initialWishes={wishes}
    />
  );
}

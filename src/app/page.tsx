import Navbar from '../components/containers/Navbar';
import HeroSection from '../components/containers/Hero';
import BioSection from '../components/containers/Bio';
import MilestonesSection from '../components/containers/Milestones';
import TimelineSection from '../components/containers/Timeline';
import AwardsSection from '../components/containers/Awards';
import BlogSection from '../components/containers/Blog';
import StackSection from '../components/containers/Stack';
import ClosingCTA from '../components/containers/ClosingCTA';
import Footer from '../components/containers/Footer';

export default function Portfolio() {
  return (
    <div className="content-overflow-hidden">
      <Navbar />
      <HeroSection />
      <BioSection />
      <MilestonesSection />
      <TimelineSection />
      <AwardsSection />
      <BlogSection />
      <StackSection />
      <ClosingCTA />
      <Footer />
    </div>
  );
}

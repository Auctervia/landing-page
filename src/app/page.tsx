import { Bento } from '@/components/Bento';
import { faqs } from '@/data/faq';
import { Faq } from '@/components/Faq';
import { Footer } from '@/components/Footer';
import { Gateway } from '@/components/Gateway';
import { Hero } from '@/components/Hero';
import { Reveals } from '@/components/Motion';
import { Pilot } from '@/components/Pilot';
import { WhyNow } from '@/components/WhyNow';

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }).replace(/</g, '\\u003c'),
        }}
      />
      <Hero />
      <WhyNow />
      <Gateway />
      <Bento />
      <Pilot />
      <Faq />
      <Footer />
      <Reveals />
    </>
  );
}

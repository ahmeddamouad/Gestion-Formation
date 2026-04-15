import Accordion from "@/components/ui/Accordion";
import { FAQ_ITEMS } from "@/lib/constants";

export default function FAQSection() {
  const accordionItems = FAQ_ITEMS.map((item, index) => ({
    id: `faq-${index}`,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section id="faq" className="w-full py-24 bg-navy-800 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary font-display mb-4">
            Questions <span className="gradient-text">frequentes</span>
          </h2>
          <p className="text-text-muted">
            Tout ce que vous devez savoir sur notre formation Power BI.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion items={accordionItems} />

        {/* Contact CTA */}
        <div className="mt-8 text-center">
          <p className="text-text-muted">
            Vous avez une autre question ?{" "}
            <a
              href="mailto:contact@formations.com"
              className="text-teal-500 hover:text-teal-400 transition-colors font-medium"
            >
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

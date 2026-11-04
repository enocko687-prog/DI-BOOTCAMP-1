import Link from "next/link";

const materials = [
  {
    type: "BIBLE TEACHING",
    title: "Understanding the Gospel",
    description: "A WOFEM teaching to help you reflect on the message of the Gospel.",
    image: "bible-study.jpg",
    href: "https://www.facebook.com/Polamonz/videos/understanding-the-gospel/1383476860229229/",
  },
  {
    type: "FAITH · 1 JOHN 5:4",
    title: "Faith That Overcomes",
    description: "Keep trusting God, stay rooted in His Word, and take the next faithful step.",
    image: "church-prayer.jpg",
    href: "https://www.facebook.com/Polamonz/videos/sunday-service/1616706506564184/",
  },
  {
    type: "SERVICE · MATTHEW 5:16",
    title: "Let Your Light Shine",
    description: "Look for a practical way to encourage someone and share God's love today.",
    image: "youth-prayer.jpg",
    href: "https://www.facebook.com/Polamonz/videos/offering/1602081188053251/",
  },
];

export default function ResourcesPage() {
  return (
    <main>
      <section className="bg-forest px-5 py-20 text-center text-white">
        <p className="text-xs font-extrabold tracking-[0.2em] text-gold-light">GROW THROUGH THE WEEK</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Services & Faith Resources</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/80">Find service information, Bible teaching, and messages shared by the WOFEM church family.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-2xl bg-cream p-7">
            <p className="text-xs font-extrabold tracking-[0.15em] text-amber-700">WEEKLY GATHERING</p>
            <h2 className="mt-3 text-2xl font-extrabold text-forest">Sunday Worship Service</h2>
            <p className="mt-4 leading-7 text-muted">Join the WOFEM church family in Runda / Githogoro, Nairobi. Please contact the church to confirm the current service time before visiting.</p>
            <p className="mt-4 text-sm text-muted">Opposite Githogoro Main Stage, Runda View Area, Mbarus Place</p>
            <a className="mt-5 inline-block rounded-lg bg-forest px-5 py-3 font-bold text-white" href="tel:0110007507">Call 0110007507</a>
          </article>
          <article className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="aspect-video bg-forest">
              <iframe className="h-full w-full" src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FPolamonz%2Fvideos%2Fsunday-service%2F1616706506564184%2F&show_text=false" title="WOFEM Sunday Worship Service video" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
            <div className="p-5">
              <a data-analytics-event="service_view" className="font-bold text-forest underline" href="https://www.facebook.com/Polamonz/videos/sunday-service/1616706506564184/" target="_blank" rel="noopener noreferrer">Watch the service on Facebook ↗</a>
            </div>
          </article>
        </div>

        <div className="mt-16">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">WATCH, READ & REFLECT</p>
            <h2 className="mt-3 text-3xl font-extrabold text-forest">Sermons & Study Materials</h2>
            <p className="mt-4 leading-7 text-muted">Use these messages and reflections for personal study. Videos are hosted by the official WOFEM Facebook page.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {materials.map((material) => (
              <article key={material.title} className="overflow-hidden rounded-2xl bg-white shadow-md">
                <img className="h-52 w-full object-cover" src={`/assets/church/${material.image}`} alt="" loading="lazy" />
                <div className="p-6">
                  <p className="text-xs font-extrabold tracking-widest text-amber-700">{material.type}</p>
                  <h3 className="mt-2 text-xl font-extrabold text-forest">{material.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{material.description}</p>
                  <a data-analytics-event="resource_click" className="mt-5 inline-block font-bold text-forest underline" href={material.href} target="_blank" rel="noopener noreferrer">Open resource ↗</a>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-forest px-6 py-10 text-center text-white">
          <h2 className="text-2xl font-extrabold">Stay connected with WOFEM</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-white/75">Create a private member profile or contact the church to learn about serving opportunities.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link className="rounded-lg bg-gold px-5 py-3 font-bold text-forest" href="/register">Get started</Link>
            <Link className="rounded-lg border border-white/50 px-5 py-3 font-bold text-white" href="/login">Member sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

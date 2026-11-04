import Link from "next/link";
import { PrayerForm } from "../components/prayer-form";

const values = [
  {
    eyebrow: "GIVING THANKS",
    title: "A Heart of Gratitude",
    text: "We give thanks to God and value every person, every blessing, and every opportunity to serve.",
    icon: "♡",
  },
  {
    eyebrow: "SHARING GENEROUSLY",
    title: "A Heart of Generosity",
    text: "We share our time, gifts, and care freely, reaching out to add value and meet needs as God leads.",
    icon: "✦",
  },
  {
    eyebrow: "WELCOMING ALL",
    title: "A Heart of the Love of God",
    text: "We welcome and serve people with the love of Christ, growing together in faith and compassion.",
    icon: "♥",
  },
];

const ministries = [
  ["♫", "Worship Ministry", "Led by Pastor Evelyn Mungai.", "church-prayer.jpg"],
  ["♧", "Youth Ministry", "Led by Minister Kennedy Oluoch.", "youth-prayer.jpg"],
  ["♧", "Teenagers Ministry", "Led by Minister Enock Ochieng.", "youth-prayer.jpg"],
  ["✝", "Evangelism", "Led by Pastor Evelyn Mungai alongside Elder John.", "church-prayer.jpg"],
  ["♡", "Prayer Ministry", "Led by Pastor Evelyn Mungai.", "church-prayer.jpg"],
  ["⌂", "Duchess of Faith", "Led by Pastor Evelyn Mungai.", "bible-study.jpg"],
  ["⌂", "Men of Valor", "Led by Pastor Paul Mungai.", "church-prayer.jpg"],
  ["⌂", "Children's Ministry", "Led by Pastor Rose Muinde.", "youth-prayer.jpg"],
  ["◎", "Follow-Up & Care", "Led by Pastor Rose Muinde.", "bible-study.jpg"],
  ["◎", "Sanctuary Keepers", "Led by Minister Enock Ochieng.", "church-prayer.jpg"],
];

const sermons = [
  {
    image: "church-prayer.jpg",
    href: "https://www.facebook.com/Polamonz/videos/offering/1602081188053251/",
    label: "10:24 · OFFERING",
    title: "Christ Died for Us: Let Us Live and Give for Him",
    description: "A message from Minister Kenedy Oluoch.",
  },
  {
    image: "bible-study.jpg",
    href: "https://www.facebook.com/Polamonz/videos/understanding-the-gospel/1383476860229229/",
    label: "1:02:03 · BIBLE TEACHING",
    title: "Understanding the Gospel",
    description: "Watch the teaching shared by WOFEM.",
  },
  {
    image: "youth-prayer.jpg",
    href: "https://www.facebook.com/Polamonz/videos/sunday-service/1616706506564184/",
    label: "56:22 · SUNDAY SERVICE",
    title: "Sunday Worship Service",
    description: "Join the WOFEM church family for worship and the Word.",
  },
];

const preachings = [
  ["FAITH · 1 JOHN 5:4", "Faith That Overcomes", "Difficult moments do not have the final word. Keep trusting God, stay rooted in His Word, and take the next faithful step."],
  ["SERVICE · MATTHEW 5:16", "Let Your Light Shine", "Your kindness, honesty, and willingness to help can point others toward God's love. Look for a practical way to encourage someone today."],
  ["COURAGE · JOSHUA 1:9", "Be Strong and Courageous", "When a new challenge feels intimidating, remember that you do not face it alone. Ask God for strength and move forward with courage."],
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold leading-tight text-forest sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 leading-7 text-muted">{description}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:p-3" href="#mainContent">Skip to content</a>
      <section id="home" className="relative isolate flex min-h-[650px] items-center overflow-hidden bg-forest">
        <img src="/assets/church/youth-prayer.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10251f]/95 via-[#10251f]/75 to-[#10251f]/35" />
        <div id="mainContent" className="mx-auto w-full max-w-7xl px-5 py-24 text-white lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold tracking-[0.22em] text-gold-light">A CHURCH WITHOUT ETHNIC BOUNDARIES</p>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] sm:text-6xl lg:text-7xl">
              Encounter God.<br /><span className="text-gold-light">Grow in faith.</span><br />Live your purpose.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              We believe in the Word of God, growing in faith, and acknowledging the power of the Holy Spirit. We welcome people without ethnic boundaries and believe in raising winners in life.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a className="rounded-lg bg-gold px-6 py-3 font-bold text-forest transition hover:bg-gold-light" href="#about">Discover Our Church</a>
              <a className="rounded-lg border border-white/60 px-6 py-3 font-bold text-white transition hover:bg-white/10" href="#contact">Plan Your Visit</a>
              <Link className="rounded-lg bg-white px-6 py-3 font-bold text-forest transition hover:bg-cream" href="/register">Create account</Link>
              <Link className="rounded-lg border border-white/60 px-6 py-3 font-bold text-white transition hover:bg-white/10" href="/login">Log in</Link>
            </div>
            <p className="mt-8 text-sm text-white/80"><span aria-hidden="true">⌖</span> Runda / Githogoro, Nairobi, Kenya</p>
          </div>
        </div>
      </section>

      <section className="bg-cream px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          {[
            ["✦", "Worship", "Gather together to praise and worship God."],
            ["✝", "The Word", "Grow through biblical teaching and discipleship."],
            ["♡", "Community", "Find fellowship, encouragement, and opportunities to serve."],
          ].map(([icon, title, text]) => (
            <article key={title} className="text-center">
              <span className="text-3xl text-amber-700" aria-hidden="true">{icon}</span>
              <h2 className="mt-2 text-lg font-extrabold text-forest">{title}</h2>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="YOUR NEXT STEPS" title="How WOFEM Works" description="Whether you are visiting or already part of our family, there is a simple way to connect, grow, and serve." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["01", "Join a service", "Meet the church family in Runda / Githogoro. Contact us to confirm the latest service time and visitor details.", "#contact"],
            ["02", "Grow in faith", "Explore sermons, Bible teaching, and short reflections to keep learning through the week.", "/resources"],
            ["03", "Connect and serve", "Discover a ministry, ask for prayer, or create a private member account to stay connected.", "/register"],
          ].map(([number, title, text, href]) => (
            <article key={number} className="rounded-2xl border border-forest/10 bg-white p-7 shadow-sm">
              <span className="text-sm font-extrabold tracking-widest text-amber-700">{number}</span>
              <h3 className="mt-3 text-xl font-extrabold text-forest">{title}</h3>
              <p className="mt-3 min-h-20 leading-7 text-muted">{text}</p>
              <Link className="mt-4 inline-block font-bold text-forest underline decoration-gold decoration-2 underline-offset-4" href={href}>Explore this step →</Link>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="relative">
          <img className="h-[420px] w-full rounded-2xl object-cover shadow-xl" src="/assets/church/church-prayer.jpg" alt="WOFEM church leader praying during a service" loading="lazy" />
          <div className="absolute bottom-5 left-5 rounded-xl bg-white/95 px-5 py-3 shadow-lg">
            <strong className="block text-forest">Faith. Love. Service.</strong>
            <span className="text-sm text-muted">Growing together in Christ</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">GET TO KNOW US</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-forest sm:text-4xl">A Church Where Faith Comes Alive</h2>
          <p className="mt-5 leading-8 text-muted">World of Faith Evangelistic Ministries International is a Christian church community in Runda / Githogoro, Nairobi. We seek to share the Gospel of Jesus Christ, encourage spiritual growth, and serve people with love.</p>
          <h3 className="mt-6 font-extrabold text-forest">Our Vision</h3>
          <p className="mt-1 text-muted">Reaching out, adding value to people, and meeting the needs of the needy as the Holy Spirit leads.</p>
          <h3 className="mt-5 font-extrabold text-forest">Our Mission</h3>
          <p className="mt-1 text-muted">Raising winners in life — 1 John 5:4</p>
          <a className="mt-6 inline-block font-bold text-forest underline decoration-gold decoration-2 underline-offset-4" href="#ministries">Explore our ministries →</a>
        </div>
      </section>

      <section id="values" className="bg-cream px-5 py-20">
        <SectionHeading eyebrow="WHY WOFEM" title="A Church to Grow With" description="We choose to live and serve with grateful, generous hearts, sharing God's love with everyone." />
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="rounded-2xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="text-4xl text-gold" aria-hidden="true">{value.icon}</span>
              <p className="mt-5 text-xs font-extrabold tracking-[0.15em] text-amber-700">{value.eyebrow}</p>
              <h3 className="mt-2 text-xl font-extrabold text-forest">{value.title}</h3>
              <p className="mt-3 leading-7 text-muted">{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="OUR CHURCH FAMILY" title="Life at WOFEM" description="A glimpse of worship, prayer, and learning together as a church family." />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["youth-prayer.jpg", "Young people praying together during worship", "Growing in faith"],
            ["bible-study.jpg", "A woman listening during a church teaching session", "Learning the Word"],
            ["church-prayer.jpg", "A WOFEM church leader in prayer", "A heart of prayer"],
          ].map(([image, alt, title]) => (
            <figure key={title} className="group overflow-hidden rounded-2xl bg-white shadow-md">
              <img className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" src={`/assets/church/${image}`} alt={alt} loading="lazy" />
              <figcaption className="p-5">
                <strong className="block text-lg text-forest">{title}</strong>
                <a className="mt-2 inline-block text-sm font-semibold text-amber-800" href="https://www.facebook.com/Polamonz/photos" target="_blank" rel="noopener noreferrer">Photo from WOFEM on Facebook ↗</a>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-16">
        <SectionHeading eyebrow="OUR LEADERSHIP" title="Serving God's People Together" description="Meet the church leadership and learn more about their ministry." />
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {[
            ["P", "Pastor Paul Mungai", "Founder, together with Pastor Evelyn Mungai", "Pastor Paul founded WOFEM alongside his wife, Pastor Evelyn. Together, they serve the church and its community, sharing the Gospel and reaching out to add value to people."],
            ["E", "Pastor Evelyn Mungai", "Co-founder, with Pastor Paul Mungai", "Pastor Evelyn founded WOFEM alongside her husband, Pastor Paul. Together, they serve the church community and its vision of reaching out and meeting needs as the Holy Spirit leads."],
          ].map(([initial, name, role, description]) => (
            <article key={name} className="rounded-2xl border border-forest/10 bg-cream p-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl font-extrabold text-forest">{initial}</div>
              <h3 className="mt-4 text-xl font-extrabold">{name}</h3>
              <p className="mt-1 text-sm text-amber-800">{role}</p>
              <p className="mt-4 leading-7 text-muted">{description}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center"><a className="text-sm font-bold text-forest underline underline-offset-4" href="https://www.facebook.com/Polamonz" target="_blank" rel="noopener noreferrer">Visit the WOFEM Facebook page for more ↗</a></p>
      </section>

      <section id="ministries" className="bg-cream px-5 py-20">
        <SectionHeading eyebrow="GROW AND SERVE" title="Our Ministries" description="Discover ways to grow in faith, develop your gifts, and serve others." />
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {ministries.map(([icon, title, text, image]) => (
            <article key={title} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <img className="h-36 w-full object-cover" src={`/assets/church/${image}`} alt="" loading="lazy" />
              <div className="p-5">
                <span className="text-2xl text-gold" aria-hidden="true">{icon}</span>
                <h3 className="mt-2 font-extrabold text-forest">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="events" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="BE PART OF IT" title="Services & Upcoming Events" description="Join us for worship, fellowship, prayer, and special gatherings." />
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
            <span className="text-xs font-extrabold tracking-widest text-amber-700">WEEKLY SERVICE</span>
            <h3 className="mt-2 text-xl font-extrabold text-forest">Sunday Worship Service</h3>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-forest">
              <iframe className="h-full w-full" src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FPolamonz%2Fvideos%2Fsunday-service%2F1616706506564184%2F&show_text=false" title="WOFEM Sunday Worship Service video" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
            <a data-analytics-event="service_view" className="mt-4 inline-block text-sm font-bold text-forest underline" href="https://www.facebook.com/Polamonz/videos/sunday-service/1616706506564184/" target="_blank" rel="noopener noreferrer">Open video on Facebook ↗</a>
            <p className="mt-3 text-sm text-muted">Runda / Githogoro, Nairobi · Sunday · Please contact the church to confirm service time.</p>
          </article>
          <div className="grid gap-6">
            <article className="rounded-2xl bg-cream p-6">
              <span className="text-xs font-extrabold tracking-widest text-amber-700">PRAYER & FELLOWSHIP</span>
              <h3 className="mt-2 text-xl font-extrabold text-forest">Prayer Meeting</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Venue and schedule are being confirmed. Visitors, please call the church before attending.</p>
              <a className="mt-4 inline-block font-bold text-forest" href="tel:0110007507">0110007507</a>
            </article>
            <article className="rounded-2xl bg-cream p-6">
              <span className="text-xs font-extrabold tracking-widest text-amber-700">SPECIAL GATHERING</span>
              <h3 className="mt-2 text-xl font-extrabold text-forest">Church Events & Conferences</h3>
              <p className="mt-3 text-sm leading-6 text-muted">New gatherings will be announced here. Please confirm details before making plans.</p>
              <a className="mt-4 inline-block font-bold text-forest underline" href="https://www.facebook.com/Polamonz/videos/understanding-the-gospel/1383476860229229/" target="_blank" rel="noopener noreferrer">Watch a WOFEM teaching ↗</a>
            </article>
          </div>
        </div>
      </section>

      <section id="media" className="bg-cream px-5 py-20">
        <SectionHeading eyebrow="WATCH & GROW" title="Sermons & Worship" description="Make room for the Word of God and share the message of hope." />
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {sermons.map((sermon) => (
            <article key={sermon.title} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <a href={sermon.href} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${sermon.title} on Facebook`}>
                <img className="h-52 w-full object-cover" src={`/assets/church/${sermon.image}`} alt="" loading="lazy" />
              </a>
              <div className="p-6">
                <span className="text-xs font-extrabold tracking-widest text-amber-700">{sermon.label}</span>
                <h3 className="mt-2 text-lg font-extrabold text-forest">{sermon.title}</h3>
                <p className="mt-2 text-sm text-muted">{sermon.description}</p>
                <a data-analytics-event="resource_click" className="mt-4 inline-block text-sm font-bold text-forest underline" href={sermon.href} target="_blank" rel="noopener noreferrer">Watch on Facebook ↗</a>
              </div>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-16 max-w-7xl">
          <SectionHeading eyebrow="REFLECT ON THE WORD" title="Short Preachings" description="Brief messages to encourage your walk with God." />
          <div className="grid gap-5 md:grid-cols-3">
            {preachings.map(([label, title, text]) => (
              <article key={title} className="rounded-xl border border-forest/10 bg-white p-6">
                <span className="text-xs font-extrabold tracking-widest text-amber-700">{label}</span>
                <h3 className="mt-3 text-lg font-extrabold text-forest">{title}</h3>
                <p className="mt-3 leading-7 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest px-5 py-16 text-center text-white">
        <p className="text-xs font-extrabold tracking-[0.2em] text-gold-light">OUR FOUNDATION</p>
        <blockquote className="mx-auto mt-4 max-w-3xl text-2xl font-bold leading-relaxed sm:text-3xl">“For we walk by faith, not by sight.”</blockquote>
        <p className="mt-3 text-sm text-white/70">2 Corinthians 5:7 (KJV)</p>
      </section>

      <section id="prayer" className="bg-cream px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">WE ARE HERE FOR YOU</p>
            <h2 className="mt-3 text-3xl font-extrabold text-forest sm:text-4xl">How Can We Pray for You?</h2>
            <p className="mt-5 leading-7 text-muted">Share a prayer request if you feel comfortable. You may leave out sensitive details.</p>
            <p className="mt-4 rounded-lg border-l-4 border-gold bg-white p-4 text-sm leading-6 text-muted">Your request is stored privately for authorized church staff, not posted publicly. Please do not include urgent or highly confidential details.</p>
            <div className="mt-6 rounded-xl bg-forest p-5 text-white">
              <p className="font-bold">Already part of the WOFEM family?</p>
              <p className="mt-1 text-sm text-white/75">Create a member account to keep your church community profile in one place.</p>
              <Link className="mt-3 inline-block font-bold text-gold-light underline" href="/register">Create a member account →</Link>
            </div>
          </div>
          <PrayerForm />
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="WE WOULD LOVE TO CONNECT" title="Visit or Contact Us" description="We look forward to welcoming you into our church community." />
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 p-6">
            <span className="text-2xl text-gold" aria-hidden="true">⌖</span>
            <h3 className="mt-3 font-extrabold text-forest">Location</h3>
            <p className="mt-2 text-sm leading-6 text-muted">Opposite Githogoro Main Stage, Runda View Area, Mbarus Place</p>
            <a className="mt-4 inline-block text-sm font-bold text-forest underline" href="https://www.google.com/maps/search/?api=1&query=World+of+Faith+Evangelistic+Ministries+opposite+Githogoro+Main+Stage+Runda+View+Area+Mbarus+Place" target="_blank" rel="noopener noreferrer">Find WOFEM on Google Maps ↗</a>
          </article>
          <article className="rounded-xl border border-slate-200 p-6">
            <span className="text-2xl text-gold" aria-hidden="true">☎</span>
            <h3 className="mt-3 font-extrabold text-forest">Phone & Email</h3>
            <p className="mt-2 text-sm"><a className="text-forest underline" href="tel:0110007507">0110007507</a></p>
            <p className="mt-2 text-sm"><a className="text-forest underline" href="mailto:wofem.int2020@gmail.com">wofem.int2020@gmail.com</a></p>
          </article>
          <article className="rounded-xl border border-slate-200 p-6">
            <span className="text-2xl text-gold" aria-hidden="true">◎</span>
            <h3 className="mt-3 font-extrabold text-forest">Connect Online</h3>
            <p className="mt-2 text-sm leading-6 text-muted">Facebook: World of Faith Evangelistic Ministries page</p>
            <p className="text-sm leading-6 text-muted">YouTube: WOFEM TV · TikTok: WOFEM</p>
            <a className="mt-4 inline-block text-sm font-bold text-forest underline" href="https://www.facebook.com/Polamonz" target="_blank" rel="noopener noreferrer">Visit WOFEM on Facebook ↗</a>
          </article>
        </div>
      </section>
    </main>
  );
}

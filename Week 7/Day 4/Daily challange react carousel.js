import { Carousel } from "react-responsive-carousel";

const destinations = [
  {
    name: "Hong Kong",
    country: "China",
    description: "A city of soaring skylines, lively markets, and harbour nights.",
    image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/jrfyzvgzvhs1iylduuhj.jpg",
    alt: "Hong Kong skyline rising above Victoria Harbour",
    number: "01",
  },
  {
    name: "Macao",
    country: "China",
    description: "Portuguese lanes, grand old facades, and a bright new energy.",
    image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/c1cklkyp6ms02tougufx.webp",
    alt: "Historic architecture in Macao",
    number: "02",
  },
  {
    name: "Japan",
    country: "East Asia",
    description: "Find a new rhythm between quiet temples and neon streets.",
    image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/e8fnw35p6zgusq218foj.webp",
    alt: "A scenic view of Japan",
    number: "03",
  },
  {
    name: "Las Vegas",
    country: "United States",
    description: "Desert sunsets, dazzling nights, and room for the unexpected.",
    image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/liw377az16sxmp9a6ylg.webp",
    alt: "Las Vegas beneath the desert sky",
    number: "04",
  },
];

export default function App() {
  return (
    <div className="travel-page">
      <header className="travel-header">
        <a className="travel-brand" href="#home" aria-label="Wayfarer home">
          <span className="brand-symbol" aria-hidden="true">w</span>
          WAYFARER
        </a>
        <nav aria-label="Main navigation">
          <a href="#destinations">Destinations</a>
          <a className="header-link" href="#destinations">Plan a getaway <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="home">
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="kicker"><span /> A little further, a little freer</p>
            <h1 id="page-title">Somewhere<br />new is calling.</h1>
          </div>
          <div className="intro-aside">
            <p>Four city breaks. A hundred ways to get lost—in the best possible way.</p>
            <a href="#destinations" className="browse-link">Find your somewhere <span aria-hidden="true">↓</span></a>
          </div>
          <span className="intro-stamp" aria-hidden="true">GO<br />SEE</span>
        </section>

        <section className="destinations" id="destinations" aria-label="Featured destinations">
          <Carousel
            ariaLabel="Featured travel destinations"
            autoPlay
            infiniteLoop
            interval={5000}
            transitionTime={500}
            stopOnHover
            swipeable
            emulateTouch
            showThumbs={false}
            showStatus={false}
            showIndicators
            showArrows
          >
            {destinations.map((destination) => (
              <article className="destination-slide" key={destination.name}>
                <img src={destination.image} alt={destination.alt} />
                <div className="destination-shade" />
                <div className="destination-caption">
                  <div>
                    <p className="destination-country">{destination.country} <span>·</span> {destination.number} / 04</p>
                    <h2>{destination.name}</h2>
                    <p className="destination-description">{destination.description}</p>
                  </div>
                  <a href="#destinations" className="destination-action" aria-label={`Explore ${destination.name}`}>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </Carousel>
        </section>

        <footer className="travel-footer">
          <p><span className="footer-spark" aria-hidden="true">✳</span> The best stories start somewhere.</p>
          <span>SCROLL LESS. SEE MORE.</span>
        </footer>
      </main>
    </div>
  );
}
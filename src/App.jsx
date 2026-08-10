import { useState, useEffect, useRef } from "react";

const products = [
  { name: "WH-1000X", sub: "Wireless Noise-Cancelling Headphones", price: "$299.00", img: "/images/headphones.png" },
  { name: "Buds Air", sub: "True wireless earbuds with charging case", price: "$129.00", img: "/images/earbuds.png" },
  { name: "GX Gaming", sub: "Surround gaming headset with RGB and mic", price: "$199.00", img: "/images/gaming.png" },
  { name: "Go Speaker", sub: "Portable Bluetooth speaker, 12h battery", price: "$89.00", img: "/images/speaker.png" },
  { name: "Studio Silver", sub: "Limited edition silver wireless headphones", price: "$399.00", img: "/images/silver.png" },
  { name: "Voice One", sub: "USB studio microphone for streaming", price: "$99.00", img: "/images/mic.png" },
];

const CLONES = 3;

export default function App() {
  const [product, setProduct] = useState(products[0]);
  const [added, setAdded] = useState(false);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const trackRef = useRef(null);

  // clones on BOTH sides → infinite both ways
  const track = [
    ...products.slice(-CLONES),
    ...products,
    ...products.slice(0, CLONES),
  ];

  function addToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function next() {
    setAnimate(true);
    setIndex((i) => (i >= products.length ? i : i + 1));
  }

  function prev() {
    setAnimate(true);
    setIndex((i) => (i <= -1 ? i : i - 1));
  }

  // 1) measure card width — always fresh, even after layout changes
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const card = el.children[0];
      if (card) setStep(card.getBoundingClientRect().width + 20);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 2) auto-play heartbeat (pauses on hover, resets after any slide)
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [paused, index]);

  // 3) invisible rewinds at BOTH edges
  useEffect(() => {
    if (index === products.length) {
      const t = setTimeout(() => { setAnimate(false); setIndex(0); }, 650);
      return () => clearTimeout(t);
    }
    if (index === -1) {
      const t = setTimeout(() => { setAnimate(false); setIndex(products.length - 1); }, 650);
      return () => clearTimeout(t);
    }
  }, [index]);

  return (
    <main className="page">
      <header className="logo">SONIX</header>

      <section className="product-grid">
        <div className="info">
          <h1>{product.name}</h1>
          <p className="sub">{product.sub}</p>
          <p className="price">{product.price}</p>
          <p className="old-price">Was $349.00</p>
        </div>

        <img className="product-img" src={product.img} alt={product.name} />

        <div className="rating">
          <p className="score">4.8 <span className="stars">★★★★★</span></p>
          <p className="reviews">1,247 reviews</p>
        </div>
      </section>

      <button className={added ? "add-to-cart added" : "add-to-cart"} onClick={addToCart}>
        {added ? "✓ Added to Cart" : "Add to Cart"}
      </button>

      <section className="more">
        <h2>More from SONIX</h2>
        <p className="more-sub">Click a product to preview it above 👆</p>

        <div
          className="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className="arrow prev" onClick={prev} aria-label="Previous products">‹</button>

          <div
            className="track"
            ref={trackRef}
            style={{
              transform: `translateX(-${(index + CLONES) * step}px)`,
              transition: animate ? "transform 0.6s ease" : "none",
            }}
          >
            {track.map((p, i) => (
              <button
                key={p.name + i}
                className={product.name === p.name ? "card active" : "card"}
                onClick={() => setProduct(p)}
              >
                <img src={p.img} alt={p.name} />
                <h3>{p.name}</h3>
                <p className="p-price">{p.price}</p>
              </button>
            ))}
          </div>

          <button className="arrow next" onClick={next} aria-label="Next products">›</button>
        </div>
      </section>
    </main>
  );
}
import { useState, useEffect, useRef } from "react";

const API = "https://sonix-api-buy8.onrender.com/api"\;

function subFor(cat) {
  return ({
    Headphones: "Wireless Noise-Cancelling Headphones",
    Earbuds:    "True wireless earbuds with charging case",
    Headset:    "Surround gaming headset with RGB and mic",
    Speaker:    "Portable Bluetooth speaker, 12h battery",
    Microphone: "USB studio microphone for streaming",
  })[cat] || cat;
}

function imgFor(name) {
  const map = {
    "WH-1000X":      "/images/headphones.png",
    "Buds Air":      "/images/earbuds.png",
    "GX Gaming":     "/images/gaming.png",
    "Go Speaker":    "/images/speaker.png",
    "Studio Silver": "/images/silver.png",
    "Voice One":     "/images/mic.png",
  };
  return map[name] || "/images/headphones.png";
}

function toProduct(p) {
  return { name: p.name, sub: subFor(p.category), price: `$${p.price}.00`, img: imgFor(p.name) };
}

const CLONES = 3;

export default function App() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    let alive = true;
    function load() {
      fetch(API + "/products")
        .then((r) => r.json())
        .then((data) => {
          if (!alive) return;
          const mapped = data.map(toProduct);
          setProducts(mapped);
          if (mapped.length) setProduct(mapped[0]);
          setLoading(false);
        })
        .catch(() => {
          if (alive) setTimeout(load, 3000); // kitchen napping → knock again in 3s
        });
    }
    load();
    return () => { alive = false; };
  }, []);

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

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const card = el.children[0];
      if (card) setStep(card.getBoundingClientRect().width + 20);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

  useEffect(() => {
    if (paused || !products.length) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [paused, index, products.length]);

  useEffect(() => {
    if (index === products.length) {
      const t = setTimeout(() => { setAnimate(false); setIndex(0); }, 650);
      return () => clearTimeout(t);
    }
    if (index === -1) {
      const t = setTimeout(() => { setAnimate(false); setIndex(products.length - 1); }, 650);
      return () => clearTimeout(t);
    }
  }, [index, products.length]);

  if (loading || !product) {
    return (
      <main className="page">
        <p>Waking the kitchen… 😴 (free servers nap ~50s)</p>
      </main>
    );
  }

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
EOFcd ~/Desktop/EII/first-react
cat << 'EOF' > src/App.jsx
import { useState, useEffect, useRef } from "react";

const API = "https://sonix-api-buy8.onrender.com/api"\;

function subFor(cat) {
  return ({
    Headphones: "Wireless Noise-Cancelling Headphones",
    Earbuds:    "True wireless earbuds with charging case",
    Headset:    "Surround gaming headset with RGB and mic",
    Speaker:    "Portable Bluetooth speaker, 12h battery",
    Microphone: "USB studio microphone for streaming",
  })[cat] || cat;
}

function imgFor(name) {
  const map = {
    "WH-1000X":      "/images/headphones.png",
    "Buds Air":      "/images/earbuds.png",
    "GX Gaming":     "/images/gaming.png",
    "Go Speaker":    "/images/speaker.png",
    "Studio Silver": "/images/silver.png",
    "Voice One":     "/images/mic.png",
  };
  return map[name] || "/images/headphones.png";
}

function toProduct(p) {
  return { name: p.name, sub: subFor(p.category), price: `$${p.price}.00`, img: imgFor(p.name) };
}

const CLONES = 3;

export default function App() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    let alive = true;
    function load() {
      fetch(API + "/products")
        .then((r) => r.json())
        .then((data) => {
          if (!alive) return;
          const mapped = data.map(toProduct);
          setProducts(mapped);
          if (mapped.length) setProduct(mapped[0]);
          setLoading(false);
        })
        .catch(() => {
          if (alive) setTimeout(load, 3000); // kitchen napping → knock again in 3s
        });
    }
    load();
    return () => { alive = false; };
  }, []);

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

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const card = el.children[0];
      if (card) setStep(card.getBoundingClientRect().width + 20);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

  useEffect(() => {
    if (paused || !products.length) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [paused, index, products.length]);

  useEffect(() => {
    if (index === products.length) {
      const t = setTimeout(() => { setAnimate(false); setIndex(0); }, 650);
      return () => clearTimeout(t);
    }
    if (index === -1) {
      const t = setTimeout(() => { setAnimate(false); setIndex(products.length - 1); }, 650);
      return () => clearTimeout(t);
    }
  }, [index, products.length]);

  if (loading || !product) {
    return (
      <main className="page">
        <p>Waking the kitchen… 😴 (free servers nap ~50s)</p>
      </main>
    );
  }

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

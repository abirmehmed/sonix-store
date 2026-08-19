import { useState, useEffect, useRef } from "react";

const API = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"
  : "https://sonix-api-huy8.onrender.com/api";

const LOADER_LINES = [
  "Waking the kitchen… 😴",
  "Polishing the headphones… ✨",
  "Warming up the amps… 🔊",
  "Untangling headphone cables… 🎧",
  "Dropping the bass… 🎵",
];

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
  return {
    name: p.name,
    sub: subFor(p.category),
    num: p.price,
    price: `$${p.price}.00`,
    oldPrice: `$${p.old || p.price + 50}.00`,
    rating: p.rating || 4.5,
    reviews: p.reviews || 127,
    img: imgFor(p.name),
  };
}

const CLONES = 3;

export default function App() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [line, setLine] = useState(0);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const trackRef = useRef(null);
  const wheelLock = useRef(0);

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
          if (alive) setTimeout(load, 3000);
        });
    }
    load();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLine((l) => (l + 1) % LOADER_LINES.length), 1200);
    return () => clearInterval(id);
  }, [loading]);

  const track = [
    ...products.slice(-CLONES),
    ...products,
    ...products.slice(0, CLONES),
  ];

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.num * i.qty, 0);

  function addToCart() {
    setCart((c) => {
      const found = c.find((i) => i.name === product.name);
      if (found) {
        return c.map((i) => (i.name === product.name ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { name: product.name, num: product.num, qty: 1 }];
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function changeQty(name, d) {
    setCart((c) => c.map((i) => (i.name === name ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  }

  function checkout() {
    setOrdered(true);
    setCart([]);
    setTimeout(() => {
      setOrdered(false);
      setCartOpen(false);
    }, 1800);
  }

  function next() {
    setAnimate(true);
    setIndex((i) => (i >= products.length ? i : i + 1));
  }

  function prev() {
    setAnimate(true);
    setIndex((i) => (i <= -1 ? i : i - 1));
  }

  function onWheel(e) {
    const now = Date.now();
    if (now - wheelLock.current < 700) return;
    wheelLock.current = now;
    if ((e.deltaX || e.deltaY) > 0) next();
    else prev();
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
      <main className="page loader-page">
        <div className="eq">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <p className="loader-line">{LOADER_LINES[line]}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="topbar">
        <span className="logo">SONIX</span>
        <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Open cart">
          🛒
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>

      <section className="product-grid">
        <div className="info">
          <h1>{product.name}</h1>
          <p className="sub">{product.sub}</p>
          <p className="price">{product.price}</p>
          <p className="old-price">Was {product.oldPrice}</p>
        </div>

        <img className="product-img" src={product.img} alt={product.name} />

        <div className="rating">
          <p className="score">
            {product.rating}{" "}
            <span className="stars">
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
          </p>
          <p className="reviews">{product.reviews.toLocaleString()} reviews</p>
        </div>
      </section>

      <button className={added ? "add-to-cart added" : "add-to-cart"} onClick={addToCart}>
        {added ? "✓ Added to Cart" : "Add to Cart"}
      </button>

      <section className="more">
        <h2>More from SONIX</h2>
        <p className="more-sub">Click a product to preview it above 👆 — or just scroll the row</p>

        <div
          className="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onWheel={onWheel}
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

      {cartOpen && (
        <aside className="cart-drawer">
          <div className="cart-head">
            <h2>Your Cart 🛒</h2>
            <button onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
          </div>

          {cart.length === 0 ? (
            <p className="muted">
              {ordered ? "Order placed! 🎉 Ka-ching." : "Empty… like a drum solo without drums. 🥁"}
            </p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map((i) => (
                  <li key={i.name}>
                    <span>{i.name}</span><span className="qty"><button onClick={() => changeQty(i.name, -1)}>−</button><b>{i.qty}</b><button onClick={() => changeQty(i.name, 1)}>+</button></span>
                    <span>${(i.num * i.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="cart-total">
                <strong>Total</strong>
                <strong>${cartTotal.toFixed(2)}</strong>
              </div>
              <button className="add-to-cart" onClick={checkout}>Checkout 💳</button>
            </>
          )}
        </aside>
      )}
    </main>
  );
}

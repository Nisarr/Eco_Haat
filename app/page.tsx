'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight, Leaf, Recycle, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Counter animation hook
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

// Floating leaves component
function FloatingLeaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-20"
          initial={{
            x: Math.random() * 100 + '%',
            y: -50,
            rotate: 0
          }}
          animate={{
            y: '100vh',
            rotate: 360,
            x: `${Math.random() * 100}%`
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear'
          }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}

// Stats counter component
function StatCounter({ target, label }: { target: number; label: string }) {
  const count = useCounter(target);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white">{count.toLocaleString()}+</div>
      <div className="text-primary-200 mt-1">{label}</div>
    </div>
  );
}

// Category card
const categories = [
  { icon: '📄', name: 'Paper Products', count: '150+', slug: 'paper' },
  { icon: '🎋', name: 'Bamboo Products', count: '200+', slug: 'bamboo' },
  { icon: '🏺', name: 'Clay & Pottery', count: '80+', slug: 'clay' },
  { icon: '🧵', name: 'Jute & Fiber', count: '120+', slug: 'jute' },
  { icon: '👕', name: 'Organic Textiles', count: '90+', slug: 'textiles' },
  { icon: '🪵', name: 'Wooden Crafts', count: '110+', slug: 'wood' },
  { icon: '📦', name: 'Eco Packaging', count: '60+', slug: 'packaging' },
  { icon: '🌸', name: 'Natural Cosmetics', count: '75+', slug: 'cosmetics' },
];

// Features data
const features = [
  {
    icon: <Leaf className="w-8 h-8" />,
    title: '100% Eco-Friendly',
    description: 'Every product is verified for sustainability and rated by our eco-experts.'
  },
  {
    icon: <Recycle className="w-8 h-8" />,
    title: 'Natural Materials',
    description: 'Bamboo, paper, clay, jute, and biodegradable materials only.'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Support Artisans',
    description: 'Direct support to local craftsmen and sustainable businesses.'
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Zero Plastic',
    description: 'Our mission is simple: Replace plastic with planet-friendly alternatives.'
  },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, profiles(full_name)')
        .eq('status', 'approved')
        .limit(4);

      if (data) setProducts(data);
    };
    fetchProducts();
  }, [supabase]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
        <FloatingLeaves />

        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            className="max-w-3xl"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-primary-200 mb-6"
            >
              <span>🌍</span>
              <span className="text-sm font-medium">Join the Green Revolution</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6"
            >
              Shop <span className="text-gradient bg-gradient-to-r from-primary-300 to-lime-300 bg-clip-text text-transparent">Sustainably</span>,<br />
              Live Responsibly
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl"
            >
              Discover handcrafted, eco-friendly products made from bamboo, paper, clay,
              and natural fibers. Every purchase you make helps reduce plastic waste
              and supports sustainable artisans.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products">
                <Button size="lg" className="group">
                  Explore Products
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </Link>
              <Link href="/register?role=seller">
                <Button variant="secondary" size="lg">
                  Become a Seller
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20"
            >
              <StatCounter target={5000} label="Eco Products" />
              <StatCounter target={1200} label="Happy Customers" />
              <StatCounter target={500} label="Green Sellers" />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white/50 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <span className="text-xs">Scroll Down</span>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary-600 font-medium">Why Choose Eco Haat</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
              The Future of Conscious Shopping
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 hover:shadow-eco transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary-500 text-white flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50" id="categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary-600 font-medium">Browse By</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
              Eco-Friendly Categories
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="block p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-eco transition-all duration-300 text-center group"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <h5 className="font-semibold text-gray-900">{category.name}</h5>
                  <span className="text-sm text-gray-500">{category.count} items</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary-600 font-medium">Top Picks</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
              Featured Eco Products
            </h2>
          </motion.div>

          {products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-eco transition-all duration-300 group">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
                        )}
                        {product.eco_rating && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-primary-700">
                            🌿 {product.eco_rating}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h5>
                        <p className="text-sm text-gray-500 mb-2">{product.profiles?.full_name || 'Eco Seller'}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary-600">৳{product.price}</span>
                          <span className="text-xs text-gray-400">{product.material}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Products coming soon!</p>
              <p className="text-sm text-gray-400">Connect your Supabase database to see products.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg">
                View All Products
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About / Impact Section */}
      <section className="py-20 bg-gradient-hero text-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-lime-300 font-medium">Our Impact</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-6">
                Making Earth Greener, One Product at a Time
              </h2>
              <p className="text-primary-100 text-lg mb-8">
                Every product on Eco Haat is rated for its eco-friendliness by our expert team.
                We verify materials, production processes, and packaging to ensure you&apos;re truly
                making a sustainable choice.
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-primary-200 text-sm">Kg Plastic Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">100+</div>
                  <div className="text-primary-200 text-sm">Local Artisans</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-primary-200 text-sm">Avg Eco Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
            >
              <h4 className="text-xl font-semibold mb-4">🌿 Our Eco Rating System</h4>
              <p className="text-primary-100 mb-6">Products are rated 0-100% based on:</p>
              <ul className="space-y-3">
                {['Material sustainability', 'Biodegradability', 'Production impact', 'Packaging eco-friendliness', 'Carbon footprint'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-primary-100">
                    <span className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-sm">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Ready to Go Green?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of conscious consumers and eco-friendly sellers.
              Start your sustainable journey today!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Start Shopping</Button>
              </Link>
              <Link href="/register?role=seller">
                <Button variant="secondary" size="lg">Sell Your Products</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

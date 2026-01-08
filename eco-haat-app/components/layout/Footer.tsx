import Link from 'next/link';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-3xl">🌿</span>
                            <span className="text-2xl font-display font-bold">Eco Haat</span>
                        </div>
                        <p className="text-primary-200 text-sm leading-relaxed">
                            Your trusted marketplace for sustainable, eco-friendly products.
                            Together, we&apos;re building a greener future.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="text-2xl hover:scale-110 transition-transform">📘</a>
                            <a href="#" className="text-2xl hover:scale-110 transition-transform">📷</a>
                            <a href="#" className="text-2xl hover:scale-110 transition-transform">🐦</a>
                            <a href="#" className="text-2xl hover:scale-110 transition-transform">📺</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="font-semibold text-lg mb-4">Quick Links</h5>
                        <ul className="space-y-2">
                            <li><Link href="/products" className="text-primary-200 hover:text-white transition-colors">All Products</Link></li>
                            <li><Link href="/#categories" className="text-primary-200 hover:text-white transition-colors">Categories</Link></li>
                            <li><Link href="/#about" className="text-primary-200 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">How It Works</Link></li>
                        </ul>
                    </div>

                    {/* For Sellers */}
                    <div>
                        <h5 className="font-semibold text-lg mb-4">For Sellers</h5>
                        <ul className="space-y-2">
                            <li><Link href="/register?role=seller" className="text-primary-200 hover:text-white transition-colors">Become a Seller</Link></li>
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">Seller Guidelines</Link></li>
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">Eco Certification</Link></li>
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">Seller Support</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h5 className="font-semibold text-lg mb-4">Support</h5>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">Shipping Info</Link></li>
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">Returns Policy</Link></li>
                            <li><Link href="#" className="text-primary-200 hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-primary-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-primary-300 text-sm">
                        © {currentYear} Eco Haat. All rights reserved. Made with 💚 for the planet.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="#" className="text-primary-300 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-primary-300 hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

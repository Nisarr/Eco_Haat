'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, Leaf, Minus, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge, EcoRating } from '@/components/ui/Badge';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    material: string;
    images: string[];
    eco_rating: number;
    stock_quantity: number;
    seller_id: string;
    profiles: { full_name: string; email: string };
    categories: { name: string };
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchProduct = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*, profiles(full_name, email), categories(name)')
                .eq('id', params.id)
                .eq('status', 'approved')
                .single();

            if (data) {
                setProduct(data as Product);
            }
            setIsLoading(false);
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id, supabase]);

    const handleAddToCart = async () => {
        setIsAddingToCart(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push(`/login?redirect=/products/${params.id}`);
            return;
        }

        try {
            // Check if item already in cart
            const { data: existing } = await supabase
                .from('cart_items')
                .select('*')
                .eq('buyer_id', user.id)
                .eq('product_id', product?.id)
                .single();

            if (existing) {
                // Update quantity
                await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id);
            } else {
                // Add new item
                await supabase.from('cart_items').insert({
                    buyer_id: user.id,
                    product_id: product?.id,
                    quantity: quantity,
                });
            }

            alert('Added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
                            <div className="h-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🌿</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-6">This product may have been removed or doesn&apos;t exist</p>
                    <Link href="/products">
                        <Button>Browse Products</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Products
                </Link>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 mb-4">
                            {product.images?.[selectedImage] ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-9xl">🌿</div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Category & Material */}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="eco">{product.material}</Badge>
                            {product.categories?.name && (
                                <Badge>{product.categories.name}</Badge>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                            {product.name}
                        </h1>

                        {/* Seller */}
                        <p className="text-gray-600">
                            Sold by <span className="font-medium text-primary-600">{product.profiles?.full_name || 'Eco Seller'}</span>
                        </p>

                        {/* Price & Eco Rating */}
                        <div className="flex items-center justify-between py-4 border-y border-gray-200">
                            <div>
                                <div className="text-3xl font-bold text-primary-600">৳{product.price}</div>
                                <div className="text-sm text-gray-500">Price includes eco packaging</div>
                            </div>
                            {product.eco_rating && (
                                <div className="text-right">
                                    <EcoRating score={product.eco_rating} />
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-200 rounded-xl">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 text-gray-500 hover:text-gray-700"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="px-4 py-2 font-medium text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-3 text-gray-500 hover:text-gray-700"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleAddToCart}
                                isLoading={isAddingToCart}
                            >
                                <ShoppingCart size={20} className="mr-2" />
                                Add to Cart
                            </Button>

                            <button className="p-3 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors">
                                <Heart size={24} className="text-gray-400 hover:text-red-500" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 pt-6">
                            <div className="text-center p-4 bg-primary-50 rounded-xl">
                                <Leaf className="mx-auto text-primary-600 mb-2" size={24} />
                                <div className="text-sm font-medium text-gray-900">100% Eco</div>
                                <div className="text-xs text-gray-500">Verified</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <Truck className="mx-auto text-blue-600 mb-2" size={24} />
                                <div className="text-sm font-medium text-gray-900">Free Shipping</div>
                                <div className="text-xs text-gray-500">Over ৳500</div>
                            </div>
                            <div className="text-center p-4 bg-amber-50 rounded-xl">
                                <Shield className="mx-auto text-amber-600 mb-2" size={24} />
                                <div className="text-sm font-medium text-gray-900">Quality</div>
                                <div className="text-xs text-gray-500">Guaranteed</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

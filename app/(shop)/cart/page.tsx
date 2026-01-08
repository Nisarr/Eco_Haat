'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface CartItem {
    id: number;
    quantity: number;
    product_id: number;
    products: {
        id: number;
        name: string;
        price: number;
        images: string[];
        material: string;
        profiles: { full_name: string };
    };
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsLoading(false);
            return;
        }

        const { data } = await supabase
            .from('cart_items')
            .select('*, products(*, profiles(full_name))')
            .eq('buyer_id', user.id);

        if (data) {
            setCartItems(data as CartItem[]);
        }
        setIsLoading(false);
    };

    const updateQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            await removeItem(itemId);
            return;
        }

        await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', itemId);

        setCartItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = async (itemId: number) => {
        await supabase.from('cart_items').delete().eq('id', itemId);
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const total = cartItems.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
                    <ArrowLeft size={20} />
                    Continue Shopping
                </Link>

                <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Add some eco-friendly products to get started!</p>
                        <Link href="/products">
                            <Button>Browse Products</Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <Card>
                                        <CardContent className="flex gap-4">
                                            {/* Image */}
                                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {item.products.images?.[0] ? (
                                                    <img
                                                        src={item.products.images[0]}
                                                        alt={item.products.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1">
                                                <Link href={`/products/${item.products.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                                                    {item.products.name}
                                                </Link>
                                                <p className="text-sm text-gray-500">{item.products.material}</p>
                                                <p className="text-sm text-gray-400">by {item.products.profiles?.full_name}</p>
                                            </div>

                                            {/* Quantity & Price */}
                                            <div className="flex flex-col items-end justify-between">
                                                <div className="text-lg font-bold text-primary-600">
                                                    ৳{item.products.price * item.quantity}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 rounded border border-gray-200 hover:bg-gray-100"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 rounded border border-gray-200 hover:bg-gray-100"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="sticky top-24">
                                <CardContent>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal ({cartItems.length} items)</span>
                                            <span>৳{total}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span className="text-primary-600">Free</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Eco Packaging</span>
                                            <span className="text-primary-600">Included</span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary-600">৳{total}</span>
                                        </div>
                                    </div>

                                    <Link href="/checkout">
                                        <Button className="w-full" size="lg">
                                            Proceed to Checkout
                                            <ArrowRight className="ml-2" size={20} />
                                        </Button>
                                    </Link>

                                    <div className="mt-4 p-3 bg-primary-50 rounded-xl text-center">
                                        <span className="text-sm text-primary-700">
                                            🌿 All orders include eco-friendly packaging
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Loader2, X, ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

const materials = [
    'Paper', 'Bamboo', 'Clay', 'Jute', 'Cotton', 'Wood', 'Recycled Materials', 'Other'
];

const categories = [
    { id: 1, name: 'Paper Products' },
    { id: 2, name: 'Bamboo Products' },
    { id: 3, name: 'Clay & Pottery' },
    { id: 4, name: 'Jute & Natural Fiber' },
    { id: 5, name: 'Organic Textiles' },
    { id: 6, name: 'Wooden Crafts' },
    { id: 7, name: 'Biodegradable Packaging' },
    { id: 8, name: 'Natural Cosmetics' },
    { id: 9, name: 'Recycled Products' },
    { id: 10, name: 'Plant-Based Items' },
];

export default function AddProductPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        material: '',
        category_id: '',
        stock_quantity: '10',
    });
    const [images, setImages] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleAddImageUrl = () => {
        if (imageUrl.trim() && images.length < 4) {
            setImages([...images, imageUrl.trim()]);
            setImageUrl('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Validation
            if (!formData.name || !formData.price || !formData.material) {
                setError('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }

            const { error: insertError } = await supabase.from('products').insert({
                seller_id: user.id,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                material: formData.material,
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                stock_quantity: parseInt(formData.stock_quantity) || 10,
                images: images,
                status: 'pending',
            });

            if (insertError) {
                setError(insertError.message);
                return;
            }

            router.push('/seller/products');
        } catch (err) {
            setError('Failed to add product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <Link href="/seller" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <h1 className="text-2xl font-display font-bold text-gray-900">Add New Product</h1>
                            <p className="text-gray-500 mt-1">List your eco-friendly product for approval</p>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Product Name */}
                                <Input
                                    label="Product Name *"
                                    placeholder="e.g. Bamboo Toothbrush Set"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Describe your eco-friendly product..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                                        rows={4}
                                    />
                                </div>

                                {/* Price & Stock */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Price (৳) *"
                                        type="number"
                                        placeholder="299"
                                        min="1"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Stock Quantity"
                                        type="number"
                                        placeholder="10"
                                        min="1"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                    />
                                </div>

                                {/* Material Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Material Type *
                                    </label>
                                    <select
                                        value={formData.material}
                                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                        required
                                    >
                                        <option value="">Select material...</option>
                                        {materials.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                    >
                                        <option value="">Select category...</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Image URLs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Product Images (up to 4)
                                    </label>

                                    {/* Image Previews */}
                                    {images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3 mb-4">
                                            {images.map((img, index) => (
                                                <div key={index} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Image URL */}
                                    {images.length < 4 && (
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input
                                                    type="url"
                                                    placeholder="Paste image URL..."
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleAddImageUrl}
                                                disabled={!imageUrl.trim()}
                                            >
                                                <ImagePlus size={20} />
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Add image URLs from the web. Your product will be reviewed by our team before approval.
                                    </p>
                                </div>

                                {/* Info Banner */}
                                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                                    <h4 className="font-medium text-primary-800 mb-1">🌿 Eco-Friendly Products Only</h4>
                                    <p className="text-sm text-primary-600">
                                        Please ensure your product is made from sustainable materials and is eco-friendly.
                                        Our admin team will review and assign an eco-rating before approval.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4 pt-4">
                                    <Link href="/seller" className="flex-1">
                                        <Button type="button" variant="secondary" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit for Review'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

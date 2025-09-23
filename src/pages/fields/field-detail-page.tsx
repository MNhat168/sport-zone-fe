import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Field {
    id: string;
    name: string;
    description: string;
    location: string;
    pricePerHour: number;
    images?: string[];
}

export default function FieldDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [field, setField] = useState<Field | null>(null);

    useEffect(() => {
        if (id) {
            console.log(`Fetching field details for ID: ${id}`);
            fetch(`http://localhost:3000/fields/${id}`)
                .then((response) => {
                    console.log(`API Response Status: ${response.status}`);
                    if (!response.ok) {
                        throw new Error(`Field not found. Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Field data received:', data);
                    setField(data.data); // Correctly set the field data
                })
                .catch((error) => {
                    console.error('Error fetching field details:', error);
                });
        }
    }, [id]);

    if (!field) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">


            <section className="relative h-[20vh] w-full bg-gray-200">
                <img
                    src={field.images?.[0] || '/default-field-image.jpg'}
                    alt={field.name}
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-4xl font-bold text-white">{field.name}</h1>
                </div>
            </section>

            {/* Details Section */}
            <main className="flex-grow max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="text-left">
                        <h2 className="text-3xl font-semibold mb-4">Thông tin về sân</h2>
                        <p className="text-lg mb-4">{field.description}</p>
                        <p className="text-md mb-2"><strong>Địa điểm:</strong> {field.location}</p>
                        <p className="text-md mb-2"><strong>Giá đặt:</strong> {field.pricePerHour} vnđ/giờ</p>
                    </div>
                </div>
            </main>


        </div>
    );
}

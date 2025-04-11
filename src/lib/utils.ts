import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Label {
    id: number;
    serial: string;
    qr_code: string;
    status: string;
    batch_id: number;
    timestamp: number;
}

interface Product {
    id: number;
    sku: string;
    brand: string;
    model: string;
    type: string;
    rating: string;
    size: string;
}

interface Batch {
    id: number;
    batch_no: string;
    shift_number: string;
    product_id: number;
    date: string;
}

export async function fetchBatchData(page = 1, limit = 100) {
    try {
        const offset = (page - 1) * limit;
        const query = `
            SELECT 
                b.*,
                p.sku, p.brand, p.model, p.type, p.rating, p.size,
                COUNT(l.id) as total_labels,
                GROUP_CONCAT(l.id || '|' || l.serial) as label_data
            FROM batches b
            LEFT JOIN products p ON b.product_id = p.id
            LEFT JOIN labels l ON b.id = l.batch_id
            GROUP BY b.id
            ORDER BY b.timestamp DESC
            LIMIT ? OFFSET ?
        `;

        const data = await window.sqlite.fetchAll(query, [limit, offset]);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(DISTINCT b.id) as total
            FROM batches b
        `;
        const totalResult = await window.sqlite.fetchAll(countQuery);
        const total = totalResult[0]?.total || 0;

        // Process the results
        const processedBatches = data.map((row: any) => ({
            id: row.id,
            batch_no: row.batch_no,
            shift_number: row.shift_number,
            product_id: row.product_id,
            date: row.date,
            product: row.sku ? {
                id: row.product_id,
                sku: row.sku,
                brand: row.brand,
                model: row.model,
                type: row.type,
                rating: row.rating,
                size: row.size
            } : undefined,
            totalLabels: row.total_labels,
            labels: row.label_data ? row.label_data.split(',').map((item: string) => {
                const [id, serial] = item.split('|');
                return { id: parseInt(id), serial_number: serial };
            }) : []
        }));

        return {
            batches: processedBatches,
            total,
            page,
            limit
        };
    } catch (error) {
        console.error("Error fetching batch data:", error);
        return {
            batches: [],
            total: 0,
            page: 1,
            limit: 100
        };
    }
}
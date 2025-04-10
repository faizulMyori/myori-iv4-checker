import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function fetchBatchData() {
    try {
        const labels: any = await window.sqlite.get_labels()
        const batches: any = await window.sqlite.get_batchs()
        const products: any = await window.sqlite.get_products()

        return batches.map((batch: any) => ({
            ...batch,
            labels: labels.filter((label: any) => label.batch_id === batch.id),
            product: products.find((product: any) => product.id === Number.parseInt(batch.product_id)),
        }))
    } catch (error) {
        console.error("Error fetching batch data:", error)
        return []
    }
}
export interface Label {
    id: number;
    serial_number: string;
}

export interface Product {
    id: number;
    sku: string;
    brand: string;
    model: string;
    type: string;
    rating: string;
    size: string;
}

export interface HistoryData {
    id: number;
    batch_no: string;
    shift_number: string;
    product_id: number;
    date: string;
    labels: Label[];
    product: Product | undefined;
    totalLabels: number;
    reportExists?: boolean;
} 
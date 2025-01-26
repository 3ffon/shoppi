import { NextRequest, NextResponse } from "next/server";
import DBController from "../dbHandler";
import { ProductInterface } from "../../lib/interfaces";


export async function POST(request: NextRequest) {
    const product: ProductInterface | null = await request.json()

    if (!product) return NextResponse.json({status: 'failed update'}, {status: 500});
        
    DBController.createProduct(product);
    return NextResponse.json(product, {status: 200});

}
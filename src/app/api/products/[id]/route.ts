import { NextRequest, NextResponse } from "next/server";
import DBController from "../../dbHandler";
import { ProductInterface } from "../../../lib/interfaces";


export async function PATCH(request: NextRequest) {
    const product: ProductInterface | null = await request.json()

    if (!product) return NextResponse.json({status: 'failed update'}, {status: 500});
        
    DBController.updateProduct(product);
    return NextResponse.json(product, {status: 200});

}

export async function DELETE(request: NextRequest) {
    const productId: string | undefined = await request.url.split('/').pop();

    if (!productId) return NextResponse.json({status: 'failed delete'}, {status: 500});

    const decodedId = decodeURIComponent(productId);
    DBController.deleteProduct(decodedId);
    return NextResponse.json({status: 'success'}, {status: 200});
}
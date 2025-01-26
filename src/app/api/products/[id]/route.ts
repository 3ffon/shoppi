import { NextRequest, NextResponse } from "next/server";
import DBController from "../../dbHandler";
import { ProductInterface } from "../../../lib/interfaces";


export async function PATCH(request: NextRequest) {
    const product: ProductInterface | null = await request.json()

    if (!product) return NextResponse.json({status: 'failed update'}, {status: 500});
        
    DBController.updateProduct(product);
    return NextResponse.json(product, {status: 200});

}
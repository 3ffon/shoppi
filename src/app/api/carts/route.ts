import { NextResponse } from 'next/server';
import DBController from '../dbHandler';
import { CartInterface } from '@/app/lib/interfaces';

export async function GET() {
    try {
        const db = DBController.getDB();
        return NextResponse.json({ carts: db?.carts || [] });
    } catch (error) {
        console.error('Failed to get carts:', error);
        return NextResponse.json({ error: 'Failed to get carts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cart: CartInterface = await request.json();
        
        if (!cart.id || !cart.name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        DBController.addNewCart(cart);

        return NextResponse.json(cart);
    } catch (error) {
        console.error('Failed to create cart:', error);
        return NextResponse.json(
            { error: 'Failed to create cart' },
            { status: 500 }
        );
    }
}
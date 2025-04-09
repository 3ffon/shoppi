import { NextResponse } from 'next/server';
import DBController from '../dbHandler';
import { CartItemInterface } from '@/app/lib/interfaces';

export async function GET() {
    try {
        const db = DBController.getDB();
        return NextResponse.json({ mainCart: db?.mainCart });
    } catch (error) {
        console.error('Failed to get main cart:', error);
        return NextResponse.json({ error: 'Failed to get main cart' }, { status: 500 });
    }
}

// Add item to cart
export async function POST(request: Request) {
    try {
        const item: CartItemInterface = await request.json();
        
        if (!item.id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }
        
        const result = DBController.addItemToCart(item);
        
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to add item to cart:', error);
        return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
    }
}

// Update item in cart
export async function PUT(request: Request) {
    try {
        const item: CartItemInterface = await request.json();
        
        if (!item.id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }
        
        const result = DBController.addItemToCart(item); // This also works for updates
        
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to update item in cart:', error);
        return NextResponse.json({ error: 'Failed to update item in cart' }, { status: 500 });
    }
}

// Delete item from cart
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }
        
        const item: CartItemInterface = { id, quantity: 0, checked: false };
        const result = DBController.removeItemFromCart(item);
        
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to remove item from cart:', error);
        return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
    }
}

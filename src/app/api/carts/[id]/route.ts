import { NextResponse } from "next/server";
import DBController from "../../dbHandler";
import { CartInterface } from "@/app/lib/interfaces";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cart = DBController.getCart(params.id);
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Failed to get cart:", error);
    return NextResponse.json({ error: "Failed to get cart" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates: Partial<CartInterface> = await request.json();
    const result = DBController.updateCart(params.id, updates);

    if ("status" in result && result.status === "cart not found") {
      return NextResponse.json({ error: result.status }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = DBController.clearCart(params.id);

    // Type guard to check if result is an error response
    if ("status" in result) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to clear cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}

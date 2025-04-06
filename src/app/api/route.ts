import { NextResponse } from "next/server";
// import { NextResponse, NextRequest } from "next/server";
import DBController from "./dbHandler";
import { ApiResponseInterface, DBReseponseInterface, SectionInterface } from "../lib/interfaces";

export async function GET() {
// export async function GET(request: NextRequest) {
  // console.log('GOT FROM', request.headers.get('user-agent'));

  const db : DBReseponseInterface | undefined = DBController.getDB();
  
  // map of sections by id
  const sectionsMap: { [key: string]: SectionInterface } = {};
  db?.sections.map(section => {
    sectionsMap[section.id] = section;
  });

  // order items by section order, then by quantity existence (>0), then by name
  const items = db?.products.sort((a, b) => {
    if (a.section !== b.section) {
      return (sectionsMap[a.section].order ?? 999) - (sectionsMap[b.section].order ?? 999);
    }
    
    // If section and quantity existence are the same, sort by name
    else return a.name.localeCompare(b.name);
  });

  if (!items) {
    return NextResponse.json({ error: 'No items found' }, { status: 404 });
  }

  const mainCart = db?.mainCart;
  
  const body : ApiResponseInterface = {
    items,
    sections: sectionsMap,
    mainCart
  }

  return NextResponse.json(
    body,
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    }
  );
}

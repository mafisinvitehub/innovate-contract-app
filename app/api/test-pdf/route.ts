import { NextRequest, NextResponse } from "next/server";
import { generatePdf } from "@/lib/generatePdf";

export async function POST(req: NextRequest) {

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);

        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    const body = await req.json();

    const data = {
        ...body,
        event: {
            ...body.event,
            formattedDate: formatDate(body.event.date), // ✅ NEW
        },
        date: new Date().toLocaleDateString("en-GB"),
    };
    const pdf = await generatePdf(data);

    return new NextResponse(pdf, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=contract.pdf",
        },
    });
}
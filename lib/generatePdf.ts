import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { getBase64Image } from "./getBase64";

// 🔥 Helpers
Handlebars.registerHelper("inc", function (value) {
    return value + 1;
});

Handlebars.registerHelper("calcTop", function (index) {
    return 150 + index * 35;
});

Handlebars.registerHelper("sessionNumber", function (index, base) {
    return base + index + 1;
});

// 🔥 ENV CHECK
const isLocal = process.env.NODE_ENV !== "production";

// 🔥 BROWSER LAUNCH FUNCTION
async function launchBrowser() {
    if (isLocal) {
        const puppeteerFull = await import("puppeteer");

        return puppeteerFull.default.launch({
            headless: true,
        });
    }

    return puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
    });
}

export async function generatePdf(data: any) {
    try {
        const templatePath = path.join(process.cwd(), "templates", "contract.hbs");

        // ✅ Read template
        const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

        // ✅ Convert team string → array
        const formattedSessions = data.sessions.map((s: any) => ({
            ...s,
            team: s.team
                ? s.team.split("\n").map((t: string) => t.trim()).filter(Boolean)
                : [],
        }));

        // ✅ Compile template
        const compiled = Handlebars.compile(htmlTemplate);

        // ✅ Images
        const bg = getBase64Image("contract-bg.jpeg");
        const logo = getBase64Image("logo.png");

        // 🔥 Pagination
        const firstPageLimit = 1;
        const firstPageSessions = formattedSessions.slice(0, firstPageLimit);
        const remainingSessions = formattedSessions.slice(firstPageLimit);

        const chunkSize = 3;
        const remainingSessionChunks = [];

        for (let i = 0; i < remainingSessions.length; i += chunkSize) {
            remainingSessionChunks.push({
                sessions: remainingSessions.slice(i, i + chunkSize),
                startIndex: firstPageLimit + i,
            });
        }

        // ✅ Final HTML
        const finalHtml = compiled({
            ...data,
            firstPageSessions,
            remainingSessionChunks,
            bg,
            logo,
        });

        // 🚀 Launch browser (🔥 FIXED)
        const browser = await launchBrowser();

        const page = await browser.newPage();

        await page.setContent(finalHtml, {
            waitUntil: "networkidle0",
        });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        await browser.close();

        return pdf;

    } catch (error) {
        console.error("PDF ERROR:", error);
        throw error;
    }
}
import fs from "fs";
import path from "path";

export function getBase64Image(fileName: string) {
    const filePath = path.join(process.cwd(), "public/template", fileName);
    const image = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${image.toString("base64")}`;
}
"use client";

import { useState } from "react";

type SessionType = {
    id: number;
    title: string;
    time: string;
    team: string;
};

export default function ContractForm() {
    const [form, setForm] = useState({
        client: {
            name: "",
            address: "",
            mobile: "",
            email: "",
        },
        event: {
            name: "",
            date: "",
            venue: "",
            couple: "",
            timeRange: "",
        },
        package: {
            name: "",
            total: "",
            advance: "",
        },
        sessions: [] as SessionType[],
    });
    const [loading, setLoading] = useState(false);

    /* ---------------- SESSION LOGIC ---------------- */

    const addSession = () => {
        setForm({
            ...form,
            sessions: [
                ...form.sessions,
                {
                    id: Date.now(),
                    title: "",
                    time: "",
                    team: "",
                },
            ],
        });
    };

    const updateSession = (
        id: number,
        field: keyof SessionType,
        value: string
    ) => {
        const updated = form.sessions.map((s) =>
            s.id === id ? { ...s, [field]: value } : s
        );

        setForm({ ...form, sessions: updated });
    };

    const removeSession = (id: number) => {
        const updated = form.sessions.filter((s) => s.id !== id);
        setForm({ ...form, sessions: updated });
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/test-pdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                alert("PDF generation failed");
                return;
            }

            // ✅ get filename from header
            const disposition = res.headers.get("content-disposition");

            let fileName = "contract.pdf";

            if (disposition && disposition.includes("filename=")) {
                fileName = disposition
                    .split("filename=")[1]
                    .replace(/"/g, "");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = fileName; // 🔥 dynamic filename
            a.click();

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 space-y-8">

                <h1 className="text-2xl font-bold text-center">
                    Contract Generator
                </h1>

                {/* CLIENT */}
                <Section title="Client Details">
                    <Input label="Name" onChange={(v) => setForm({ ...form, client: { ...form.client, name: v } })} />
                    <Input label="Address" onChange={(v) => setForm({ ...form, client: { ...form.client, address: v } })} />
                    <Input label="Mobile" onChange={(v) => setForm({ ...form, client: { ...form.client, mobile: v } })} />
                    <Input label="Email" onChange={(v) => setForm({ ...form, client: { ...form.client, email: v } })} />
                </Section>

                {/* EVENT */}
                <Section title="Event Details">
                    <Input label="Bride / Groom" onChange={(v) => setForm({ ...form, event: { ...form.event, couple: v } })} />
                    <Input label="Event Name" onChange={(v) => setForm({ ...form, event: { ...form.event, name: v } })} />
                    <Input type="date" label="Date" onChange={(v) => setForm({ ...form, event: { ...form.event, date: v } })} />
                    <Input label="Time Range (e.g. 8 am – 3 pm and 5 pm – 10 pm)" onChange={(v) => setForm({
                        ...form,
                        event: { ...form.event, timeRange: v },
                    })}
                    />
                    <Input label="Venue" onChange={(v) => setForm({ ...form, event: { ...form.event, venue: v } })} />
                </Section>

                {/* PACKAGE */}
                <Section title="Package">
                    <Input label="Package Name" onChange={(v) => setForm({ ...form, package: { ...form.package, name: v } })} />
                    <Input label="Total" onChange={(v) => setForm({ ...form, package: { ...form.package, total: v } })} />
                    <Input label="Advance" onChange={(v) => setForm({ ...form, package: { ...form.package, advance: v } })} />
                </Section>

                {/* SESSIONS */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Sessions</h2>

                    {form.sessions.map((s) => (
                        <div key={s.id} className="border rounded-lg p-4 mb-4 bg-gray-50 space-y-3">

                            <Input
                                label="Session Title"
                                onChange={(v) => updateSession(s.id, "title", v)}
                            />

                            {/* <Input
                                type="time"
                                label="Time"
                                onChange={(v) => updateSession(s.id, "time", v)}
                            /> */}

                            {/* TEAM BULLET EDITOR */}
                            <div>
                                <label className="text-sm font-medium">Team (Bullet style)</label>
                                <textarea
                                    placeholder={`Example:
Event Co-ordinator
Photographer
Videographer`}
                                    className="w-full border rounded-md p-2 mt-1"
                                    rows={4}
                                    onChange={(e) =>
                                        updateSession(s.id, "team", e.target.value)
                                    }
                                />
                            </div>

                            <button
                                onClick={() => removeSession(s.id)}
                                className="text-red-500 text-sm"
                            >
                                Remove Session
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addSession}
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        + Add Session
                    </button>
                </div>

                {/* SUBMIT */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300
        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white cursor-pointer"}`}
                >
                    {loading ? (
                        <>
                            <Spinner />
                            Generating PDF
                        </>
                    ) : (
                        "Generate PDF"
                    )}
                </button>

            </div>
        </div>
    );
}

/* ---------------- REUSABLE COMPONENTS ---------------- */

function Section({ title, children }: any) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            <div className="grid grid-cols-2 gap-4">{children}</div>
        </div>
    );
}

function Input({
    label,
    onChange,
    type = "text",
}: {
    label: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <input
                type={type}
                className="w-full border rounded-md p-2 mt-1"
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function Spinner() {
    return (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    );
}
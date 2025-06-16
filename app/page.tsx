```tsx
"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, output }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
      alert("Something went wrong – see console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-6 bg-gray-50">
      <h1 className="text-3xl font-semibold pt-4">AI Bibliography Demo</h1>

      <Card className="w-full max-w-3xl shadow-lg">
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Prompt</label>
              <Textarea rows={4} required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Model Output</label>
              <Textarea rows={6} required value={output} onChange={(e) => setOutput(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Evaluate & Generate Badge"}
            </Button>
          </form>

          {result && (
            <div className="border rounded-xl p-4 bg-white/70 mt-4">
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
```


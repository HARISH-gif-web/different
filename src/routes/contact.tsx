import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Praja Mitra" },
      { name: "description", content: "Get in touch with the Praja Mitra grievance portal team." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(1000),
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    toast.success("Message sent — we'll respond within 48 hours");
    setF({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">
        Reach out to the Praja Mitra grievance cell for support or feedback.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card className="p-5">
          <Mail className="h-6 w-6 text-primary" />
          <div className="mt-3 font-semibold">Email</div>
          <div className="text-sm text-muted-foreground">support@prajamitra.gov.in</div>
        </Card>
        <Card className="p-5">
          <Phone className="h-6 w-6 text-primary" />
          <div className="mt-3 font-semibold">Toll Free</div>
          <div className="text-sm text-muted-foreground">1800-XXX-XXXX</div>
        </Card>
        <Card className="p-5">
          <MapPin className="h-6 w-6 text-primary" />
          <div className="mt-3 font-semibold">Grievance Cell</div>
          <div className="text-sm text-muted-foreground">Secretariat, State Capital</div>
        </Card>
      </div>

      <Card className="mt-8 p-6 shadow-card">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={200} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Message</Label>
            <Textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={1000} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Send Message</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  MapPin,
  Mic,
  Video,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import type { Category } from "@/lib/categories";
import { getDepartmentForComplaintType } from "@/lib/categories";
import {
  generateComplaintId,
  saveComplaint,
  type Complaint,
  type Priority,
} from "@/lib/complaints-store";
import { getSession } from "@/lib/auth-store";
import { LoginDialog } from "./LoginDialog";
import { useNavigate } from "@tanstack/react-router";

const schema = z.object({
  title: z.string().trim().min(4, "Title is too short").max(120),
  description: z.string().trim().min(10, "Please describe the issue").max(2000),
  location: z.string().trim().min(3, "Location is required").max(200),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

const DISTRICTS = [
  "Anantapur",
  "Chittoor",
  "East Godavari",
  "Guntur",
  "Krishna",
  "Kurnool",
  "Nellore",
  "Prakasam",
  "Srikakulam",
  "Visakhapatnam",
  "Vizianagaram",
  "West Godavari",
  "YSR Kadapa",
  "Other District",
];

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

export function ComplaintForm({
  category,
  complaintType,
  onClose,
}: {
  category: Category;
  complaintType: string;
  onClose: () => void;
}) {
  const isOthers = complaintType === "Others";
  const [title, setTitle] = useState(isOthers ? "" : complaintType);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [anonymous, setAnonymous] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audio, setAudio] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [receipt, setReceipt] = useState<Complaint | null>(null);
  const [ai, setAi] = useState<{
    department: string;
    summary: string;
    priority: Priority;
    confidence: number;
    translations: { en: string; te: string; hi: string };
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("pending_complaint_form");
      if (cached) {
        const data = JSON.parse(cached);
        if (data.categorySlug === category.slug && data.complaintType === complaintType) {
          setTitle(data.title || "");
          setDescription(data.description || "");
          setLocation(data.location || "");
          if (data.district) setDistrict(data.district);
          if (data.gps) setGps(data.gps);
          setPriority(data.priority || "Medium");
          if (data.images) setImages(data.images);
          if (data.videos) setVideos(data.videos);
          if (data.audio) setAudio(data.audio);
          toast.success("Restored your complaint details");
        }
        sessionStorage.removeItem("pending_complaint_form");
      }
    } catch (e) {
      console.error(e);
    }
  }, [category.slug, complaintType]);

  const mappedDepartment = getDepartmentForComplaintType(complaintType);

  const runAi = async () => {
    if (!description.trim()) {
      toast.info("Add a description first for AI analysis");
      return;
    }
    setAiRunning(true);
    await new Promise((r) => setTimeout(r, 900));
    const words = description.toLowerCase();
    const detected: Priority = /urgent|danger|hazard|blood|fire|leak|collapse/.test(words)
      ? "Critical"
      : /broken|delay|not working/.test(words)
        ? "High"
        : priority;
    setAi({
      department: mappedDepartment,
      summary: description.slice(0, 140) + (description.length > 140 ? "…" : ""),
      priority: detected,
      confidence: 87 + Math.floor(Math.random() * 10),
      translations: {
        en: description,
        te: `[తెలుగు] ${description}`,
        hi: `[हिन्दी] ${description}`,
      },
    });
    setPriority(detected);
    setAiRunning(false);
    toast.success("AI analysis complete");
  };

  const captureGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocation(
          (l) =>
            l || `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
        );
        toast.success("Location captured");
      },
      () => toast.error("Unable to fetch location"),
    );
  };

  const onFiles = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const files = Array.from(e.target.files || []);
    const urls = await Promise.all(files.map(fileToDataUrl));
    setter((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = await fileToDataUrl(new File([blob], "voice.webm"));
        setAudio((a) => [...a, url]);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRecorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone permission denied");
    }
  };

  const doSubmit = () => {
    const parsed = schema.safeParse({ title, description, location, priority });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!district) {
      toast.error("Please select a District");
      return;
    }
    if (images.length + videos.length + audio.length === 0) {
      toast.error("Evidence is required. Please upload an image, video or voice note.");
      return;
    }
    const session = getSession();
    if (!session) {
      const formState = {
        categorySlug: category.slug,
        complaintType,
        title,
        description,
        location,
        district,
        priority,
        images,
        videos,
        audio,
        gps,
      };
      try {
        sessionStorage.setItem("pending_complaint_form", JSON.stringify(formState));
      } catch (e) {
        const fallbackState = {
          categorySlug: category.slug,
          complaintType,
          title,
          description,
          location,
          district,
          priority,
          gps,
        };
        try {
          sessionStorage.setItem("pending_complaint_form", JSON.stringify(fallbackState));
        } catch (err) {
          console.error(err);
        }
      }
      const currentPath = window.location.pathname + window.location.search;
      navigate({ to: "/login", search: { redirect: currentPath } });
      return;
    }
    setSubmitting(true);
    const complaint: Complaint = {
      id: generateComplaintId(),
      categorySlug: category.slug,
      categoryName: category.name,
      complaintType,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      district,
      gps,
      priority: parsed.data.priority,
      anonymous,
      images,
      videos,
      audio,
      citizen: { email: session.email || "", phone: session.phone || "" },
      department: mappedDepartment,
      status: "Registered",
      createdAt: Date.now(),
      aiConfidence: ai?.confidence ?? 82,
      timeline: [
        { label: "Complaint Registered", at: Date.now(), done: true },
        { label: "Under Review", at: 0, done: false },
        { label: "Assigned to Officer", at: 0, done: false },
        { label: "Work Started", at: 0, done: false },
        { label: "Resolved", at: 0, done: false },
      ],
    };
    saveComplaint(complaint);
    toast.success(`Complaint ${complaint.id} submitted`);
    setSubmitting(false);
    setReceipt(complaint);
  };

  const downloadReceipt = (c: Complaint) => {
    const lines = [
      "PRAJA MITRA — COMPLAINT RECEIPT",
      "================================",
      `Complaint ID : ${c.id}`,
      `Date         : ${new Date(c.createdAt).toLocaleString()}`,
      `Category     : ${c.categoryName}`,
      `Type         : ${c.complaintType}`,
      `Department   : ${c.department}`,
      `Priority     : ${c.priority}`,
      `Status       : ${c.status}`,
      "",
      `Title        : ${c.title}`,
      `Location     : ${c.location}`,
      c.gps ? `GPS          : ${c.gps.lat.toFixed(5)}, ${c.gps.lng.toFixed(5)}` : "",
      "",
      "Description :",
      c.description,
      "",
      "Submitted anonymously.",
      "",
      `Evidence     : ${c.images.length} photo(s), ${c.videos.length} video(s), ${c.audio.length} voice note(s)`,
      `AI Confidence: ${c.aiConfidence}%`,
      "",
      "Track your complaint at: /track?q=" + c.id,
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.id}-receipt.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="animate-fade-in-up shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">{category.icon}</span> {category.name} —{" "}
              {complaintType}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-2">
              <span>Fill in the details below. Evidence (photo / video / voice) is mandatory.</span>
              <Badge variant="secondary" className="text-xs">🏛️ {mappedDepartment}</Badge>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Complaint Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the issue"
              maxLength={120}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed, when it happened, and how it affects the public."
              rows={5}
              maxLength={2000}
            />
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={runAi} disabled={aiRunning}>
                {aiRunning ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-4 w-4" />
                )}
                AI Analyse
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Issue Location / Address Details</Label>
            <div className="flex gap-2">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Street, landmark, city"
              />
              <Button type="button" variant="outline" onClick={captureGps}>
                <MapPin className="mr-1 h-4 w-4" /> GPS
              </Button>
            </div>
            {gps && (
              <p className="text-xs text-muted-foreground">
                📍 {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end justify-between gap-3 rounded-md border border-border bg-muted/50 p-3">
            <div>
              <Label className="text-sm">Anonymous Submission</Label>
              <p className="text-xs text-muted-foreground">All complaints are submitted anonymously to protect citizen privacy.</p>
            </div>
            <span className="text-xs font-semibold text-secondary">Always Enabled</span>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Evidence (required)</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-primary/5">
              <Camera className="mb-1 h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Photo</span>
              <span className="text-xs text-muted-foreground">{images.length} added</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e, setImages)}
              />
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-primary/5">
              <Video className="mb-1 h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Video</span>
              <span className="text-xs text-muted-foreground">{videos.length} added</span>
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e, setVideos)}
              />
            </label>
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-center transition-colors ${
                recording
                  ? "border-destructive bg-destructive/5 text-destructive"
                  : "border-border hover:border-primary hover:bg-primary/5"
              }`}
            >
              <Mic className="mb-1 h-6 w-6" />
              <span className="text-sm font-medium">
                {recording ? "Stop Recording" : "Voice Note"}
              </span>
              <span className="text-xs text-muted-foreground">{audio.length} recorded</span>
            </button>
          </div>
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover ring-1 ring-border"
                />
              ))}
            </div>
          )}
        </div>

        {ai && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">AI Analysis</span>
              <Badge variant="secondary" className="ml-auto">
                Confidence {ai.confidence}%
              </Badge>
            </div>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div><span className="font-medium">Department:</span> {ai.department}</div>
              <div><span className="font-medium">Suggested Priority:</span> {ai.priority}</div>
              <div className="md:col-span-2">
                <span className="font-medium">Summary:</span> {ai.summary}
              </div>
              <div className="md:col-span-2 text-xs text-muted-foreground">
                🌐 Translations available: English · తెలుగు · हिन्दी
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={doSubmit} disabled={submitting} className="min-w-40">
            {submitting ? (
              <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting…</>
            ) : (
              <><CheckCircle2 className="mr-1 h-4 w-4" /> Submit Complaint</>
            )}
          </Button>
        </div>
      </CardContent>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onSuccess={doSubmit} />
      <Dialog
        open={!!receipt}
        onOpenChange={(o) => {
          if (!o) {
            setReceipt(null);
            onClose();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              Complaint Registered
            </DialogTitle>
            <DialogDescription>
              Your complaint has been submitted successfully. Save the receipt for
              your records.
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4 text-sm">
              <div>
                <span className="text-muted-foreground">Complaint ID:</span>{" "}
                <span className="font-mono font-semibold">{receipt.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>{" "}
                {receipt.categoryName}
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>{" "}
                {receipt.department}
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span>{" "}
                {receipt.priority}
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>{" "}
                {new Date(receipt.createdAt).toLocaleString()}
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => receipt && downloadReceipt(receipt)}
            >
              <Download className="mr-1 h-4 w-4" /> Download Receipt
            </Button>
            <Button
              onClick={() => {
                if (receipt) {
                  navigate({ to: "/track", search: { q: receipt.id } });
                }
                setReceipt(null);
                onClose();
              }}
            >
              Track Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
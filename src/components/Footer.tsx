import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Youtube, Instagram, Phone } from "lucide-react";
import { LogoLockup } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <LogoLockup />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            An AI-powered public grievance platform empowering citizens and government to
            report, track and resolve issues faster.
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Facebook className="h-4 w-4 hover:text-primary" />
            <Twitter className="h-4 w-4 hover:text-primary" />
            <Youtube className="h-4 w-4 hover:text-primary" />
            <Instagram className="h-4 w-4 hover:text-primary" />
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About Praja Mitra</Link></li>
            <li><Link to="/register" className="hover:text-primary">Register Complaint</Link></li>
            <li><Link to="/track" className="hover:text-primary">Track Complaint</Link></li>
            <li><Link to="/ai-assistant" className="hover:text-primary">AI Assistant</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/about" className="hover:text-primary">Terms of Use</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/about" className="hover:text-primary">Departments</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Emergency Numbers</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-destructive" /> Police — 100</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-destructive" /> Ambulance — 108</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-destructive" /> Fire — 101</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-destructive" /> Women Helpline — 181</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Praja Mitra — A Digital India Initiative. All rights reserved.
      </div>
    </footer>
  );
}
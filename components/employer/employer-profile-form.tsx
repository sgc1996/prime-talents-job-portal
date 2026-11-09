"use client";

import * as React from "react";
import { useState } from "react";
import { updateEmployerProfileAction } from "@/server/actions/employer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Save, Loader2 } from "lucide-react";
import { CompanySize } from "@prisma/client";

interface Option {
  id: string;
  name: string;
}

interface EmployerProfileFormProps {
  initialData?: {
    companyName: string;
    slug: string;
    about?: string | null;
    mission?: string | null;
    vision?: string | null;
    values?: string | null;
    sectorId?: string | null;
    companySize?: CompanySize | null;
    foundedYear?: number | null;
    website?: string | null;
    address?: string | null;
    districtId?: string | null;
  } | null;
  sectors: Option[];
  districts: Option[];
}

export function EmployerProfileForm({
  initialData,
  sectors,
  districts,
}: EmployerProfileFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [about, setAbout] = useState(initialData?.about || "");
  const [mission, setMission] = useState(initialData?.mission || "");
  const [vision, setVision] = useState(initialData?.vision || "");
  const [values, setValues] = useState(initialData?.values || "");
  const [sectorId, setSectorId] = useState(initialData?.sectorId || "");
  const [companySize, setCompanySize] = useState<CompanySize>(
    initialData?.companySize || "SMALL_11_50",
  );
  const [foundedYear, setFoundedYear] = useState<string>(
    initialData?.foundedYear?.toString() || "",
  );
  const [website, setWebsite] = useState(initialData?.website || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [districtId, setDistrictId] = useState(initialData?.districtId || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateEmployerProfileAction({
        companyName,
        about,
        mission,
        vision,
        values,
        sectorId: sectorId || undefined,
        companySize,
        foundedYear: foundedYear ? parseInt(foundedYear, 10) : undefined,
        website,
        address,
        districtId: districtId || undefined,
      });

      toast.success("Company profile & branding updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* 1. General Company Info */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span>Organization Details</span>
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="company-name">Registered Company Name</Label>
          <Input
            id="company-name"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sector">Primary Sector</Label>
            <select
              id="sector"
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="">Select Industry</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-size">Company Size</Label>
            <select
              id="company-size"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value as CompanySize)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="STARTUP_1_10">Startup (1 - 10 employees)</option>
              <option value="SMALL_11_50">Small (11 - 50 employees)</option>
              <option value="MEDIUM_51_200">Medium (51 - 200 employees)</option>
              <option value="LARGE_201_1000">Large (201 - 1,000 employees)</option>
              <option value="ENTERPRISE_1000_PLUS">Enterprise (1,000+ employees)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="website">Official Website URL</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="founded-year">Founded Year</Label>
            <Input
              id="founded-year"
              type="number"
              placeholder="e.g. 2012"
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Location & Address */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Location &amp; Office</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="district">District</Label>
            <select
              id="district"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} District
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Physical Address</Label>
            <Input
              id="address"
              placeholder="e.g. No. 45, Galle Road, Colombo 03"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. About, Mission & Values */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Branding &amp; Company Overview</h3>

        <div className="space-y-1.5">
          <Label htmlFor="about">About the Organization</Label>
          <Textarea
            id="about"
            placeholder="Introduce your company culture, technology stack, and values to prospective candidates..."
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="mission">Mission Statement</Label>
            <Textarea
              id="mission"
              placeholder="Our mission is to..."
              rows={3}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vision">Vision Statement</Label>
            <Textarea
              id="vision"
              placeholder="Our vision is to..."
              rows={3}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="values">Core Values</Label>
            <Textarea
              id="values"
              placeholder="e.g. Integrity, Innovation, Empathy"
              rows={3}
              value={values}
              onChange={(e) => setValues(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" type="submit" disabled={isSaving} className="font-semibold px-8 shadow">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Company Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

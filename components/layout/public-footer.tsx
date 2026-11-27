import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";

export function PublicFooter() {
  const provinces = [
    { name: "Western Province", districts: "Colombo, Gampaha, Kalutara" },
    { name: "Central Province", districts: "Kandy, Matale, Nuwara Eliya" },
    { name: "Southern Province", districts: "Galle, Matara, Hambantota" },
    { name: "Northern Province", districts: "Jaffna, Kilinochchi, Mannar, Vavuniya" },
    { name: "Eastern Province", districts: "Batticaloa, Ampara, Trincomalee" },
    { name: "North Western", districts: "Kurunegala, Puttalam" },
    { name: "North Central", districts: "Anuradhapura, Polonnaruwa" },
    { name: "Uva & Sabaragamuwa", districts: "Badulla, Ratnapura, Kegalle" },
  ];

  return (
    <footer className="border-t bg-muted/40 text-muted-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <Image
                src="/images/logo.png"
                alt={siteConfig.name}
                width={34}
                height={34}
                className="h-8 w-8 shrink-0 object-contain rounded"
              />
              <span className="text-2xl font-bold tracking-tight text-primary">
                {siteConfig.name}
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                Sri Lanka
              </span>
            </Link>
            <p className="text-sm max-w-sm">
              Connecting Sri Lankan talent with top local and international employers. Verified opportunities across all 25 districts.
            </p>
          </div>

          {/* Job Seekers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Job Seekers
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-foreground">Browse All Vacancies</Link>
              </li>
              <li>
                <Link href="/jobs?type=REMOTE" className="hover:text-foreground">Remote Careers</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">Create Profile</Link>
              </li>
              <li>
                <Link href="/candidate/applications" className="hover:text-foreground">Application Tracker</Link>
              </li>
            </ul>
          </div>

          {/* Platform & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {siteConfig.name}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="hover:text-foreground"
                >
                  Support: {siteConfig.supportEmail}
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">Sign In</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground">Admin Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sri Lanka Location Tree Footer Banner */}
        <div className="mt-12 border-t pt-8">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
            Jobs Across All 9 Provinces &amp; 25 Districts of Sri Lanka:
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {provinces.map((prov) => (
              <div key={prov.name}>
                <span className="font-semibold text-foreground">{prov.name}:</span>
                <p className="text-muted-foreground">{prov.districts}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Sri Lanka&apos;s Career Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


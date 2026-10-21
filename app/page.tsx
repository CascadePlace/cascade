import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroEffects from "@/components/hero-effects";
import HeroSprites from "@/components/hero-sprites";
import { withBasePath } from "@/lib/base-path";
import {
  ArrowRight,
  Camera,
  Disc3,
  Facebook,
  Gamepad2,
  Headphones,
  Mail,
  Palette,
  PenTool,
  Sparkles,
  Stamp,
  Youtube,
} from "lucide-react";

const SHOW_HERO_BG = true;

type Project = {
  icon: React.ElementType;
  title: string;
  description: string;
  tags: string[];
  href?: string;
};

const projects: Project[] = [
  {
    icon: Gamepad2,
    title: "Wheelchair Attack",
    description:
      "PC & mobile video game where Dan takes on waves of enemies using an arsenal of weapons attached to his wheelchair.",
    tags: ["Video Game", "PC", "Mobile"],
    href: "https://microstudio.io/Cascade/danswart/YCN97P3S/",
  },
  {
    icon: Disc3,
    title: "Dee Dee Bjeard",
    description:
      "DJ & music producer on Spotify — vaporwave transient sounds with elements of nostalgia, crafted in Figure and Reason.",
    tags: ["Vaporwave", "Figure", "Reason"],
    href: "https://open.spotify.com/album/5V8VCyeYGh8s65Ditgvvx5",
  },
  {
    icon: Stamp,
    title: "Art & Printmaking",
    description:
      "Printmaking and fine art at Artel — currently working on a family emblem project.",
    tags: ["Artel", "Printmaking", "Family Emblem"],
  },
  {
    icon: PenTool,
    title: "Drawing & Asset Creation",
    description:
      "Illustration and asset creation for game design — from concept sketches to production-ready game art.",
    tags: ["Illustration", "Game Assets", "Concept Art"],
  },
  {
    icon: Camera,
    title: "Photography",
    description:
      "Capturing nature, dramatic weather and the energy of nightlife through the lens.",
    tags: ["Nature", "Weather", "Nightlife"],
  },
  {
    icon: Sparkles,
    title: "Coming Soon",
    description:
      "The next big thing is brewing — watch this space for a brand-new project.",
    tags: ["TBA"],
  },
];

const hobbies = [
  {
    icon: Gamepad2,
    title: "Gaming",
    description:
      "Playtesting everything from indie gems to classics — research for Wheelchair Attack.",
  },
  {
    icon: Headphones,
    title: "Crate Digging",
    description:
      "Hunting down nostalgic samples and forgotten sounds to feed the vaporwave machine.",
  },
  {
    icon: Disc3,
    title: "DJ Sets",
    description:
      "Spinning late-night mixes and testing new Dee Dee Bjeard tracks on the decks.",
  },
  {
    icon: PenTool,
    title: "Sketching",
    description:
      "Filling sketchbooks with characters and ideas that end up as game assets.",
  },
  {
    icon: Palette,
    title: "Print Experiments",
    description:
      "Trying new inks, blocks and techniques between sessions at Artel.",
  },
  {
    icon: Camera,
    title: "Photo Walks",
    description:
      "Chasing storms, golden-hour landscapes and neon-lit nightlife with a camera in hand.",
  },
];

const socials = [
  {
    icon: Facebook,
    label: "Facebook",
    handle: "Daniel Swart",
    href: "https://www.facebook.com/daniel.swart.245874",
  },
  {
    icon: Youtube,
    label: "YouTube",
    handle: "@danswart4633",
    href: "https://www.youtube.com/@danswart4633",
  },
  {
    icon: Mail,
    label: "Email",
    handle: "deedeeswart@gmail.com",
    href: "mailto:deedeeswart@gmail.com",
  },
];

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-12 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
        {kicker}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-red-600" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
        {SHOW_HERO_BG && (
          <Image
            src={withBasePath("/hero-bg-optimized.jpg")}
            alt="Dan Swart hero image"
            fill
            priority
            unoptimized
            className="object-cover object-[50%_80%]"
          />
        )}
        <div className="absolute inset-0 bg-black/25" />
        <HeroEffects />
        <HeroSprites />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-red-500">
            Portfolio
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Dan <span className="text-red-600">Swart</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-300">
            Game-maker, DJ and all-round legend — building worlds, dropping
            nostalgia-soaked beats and making everything in between look easy.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <a href="#projects">
                View My Work <ArrowRight className="ml-1 size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-red-600/60 bg-transparent text-white hover:bg-red-600/10 hover:text-red-400 dark:border-red-600/60 dark:bg-transparent dark:hover:bg-red-600/10"
            >
              <a href="#social">Get In Touch</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Projects ────────────────────────────────── */}
      <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading kicker="Selected Work" title="Projects" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const card = (
              <Card className="group h-full border-white/10 bg-neutral-950 transition-colors hover:border-red-600/60">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
                    <project.icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg text-white group-hover:text-red-500">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-red-600/40 text-red-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
            return project.href ? (
              <Link
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                {card}
              </Link>
            ) : (
              <div key={project.title} className="h-full">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Hobbies ─────────────────────────────────── */}
      <section id="hobbies" className="border-y border-white/10 bg-neutral-950/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeading kicker="Off The Clock" title="Hobbies" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {hobbies.map((hobby) => (
              <div key={hobby.title} className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-600/15 text-red-500">
                  <hobby.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{hobby.title}</h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    {hobby.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Media: YouTube + Spotify ─────────────────────── */}
      <section id="media" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading kicker="Watch & Listen" title="Media" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-red-500">
              Featured Video
            </h3>
            <div className="flex-1 overflow-hidden rounded-xl border border-white/10">
              <iframe
                src="https://www.youtube.com/embed/kXVmL-Zx3lY"
                title="Featured YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full min-h-[352px] w-full"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-red-500">
              On Rotation
            </h3>
            <div className="flex-1 overflow-hidden rounded-xl border border-white/10">
              <iframe
                src="https://open.spotify.com/embed/album/5V8VCyeYGh8s65Ditgvvx5?theme=0"
                title="Spotify album preview"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="h-full min-h-[352px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ─────────────────────────────────── */}
      <section id="gallery" className="border-y border-white/10 bg-neutral-950/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeading kicker="Visuals" title="Gallery" />
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                src: "/gallery/1.jpg",
                alt: "Pixel-art player character",
                wide: false,
              },
              {
                src: "/gallery/3.jpg",
                alt: "Pixel-art character in a power chair",
                wide: false,
              },
              {
                src: "/gallery/2.jpg",
                alt: "Mountains game background art",
                wide: true,
              },
              {
                src: "/gallery/4.jpg",
                alt: "Coastline game background art",
                wide: true,
              },
            ].map((item) => (
              <div
                key={item.src}
                className={`group relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] ${
                  item.wide ? "col-span-2 aspect-[4/1]" : "aspect-[9/10]"
                }`}
              >
                <Image
                  src={withBasePath(item.src)}
                  alt={item.alt}
                  fill
                  sizes={item.wide ? "100vw" : "50vw"}
                  className={`${
                    item.wide ? "object-cover" : "object-contain"
                  } transition-transform duration-500 group-hover:scale-105`}
                />
                <div className="absolute inset-0 bg-red-600/0 transition-colors duration-300 group-hover:bg-red-600/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social ──────────────────────────────────── */}
      <section id="social" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading kicker="Connect" title="Find Me Online" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-neutral-950 p-5 transition-colors hover:border-red-600/60 hover:bg-red-600/5"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
                <social.icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-red-500">
                  {social.label}
                </p>
                <p className="text-sm text-neutral-400">{social.handle}</p>
              </div>
              <ArrowRight className="ml-auto size-4 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-red-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-neutral-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:justify-between">
          <p className="text-lg font-bold tracking-tight">
            Dan <span className="text-red-600">Swart</span>
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-400">
            <a href="#projects" className="transition-colors hover:text-red-500">
              Projects
            </a>
            <a href="#hobbies" className="transition-colors hover:text-red-500">
              Hobbies
            </a>
            <a href="#media" className="transition-colors hover:text-red-500">
              Media
            </a>
            <a href="#gallery" className="transition-colors hover:text-red-500">
              Gallery
            </a>
            <a href="#social" className="transition-colors hover:text-red-500">
              Social
            </a>
          </nav>
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Dan Swart. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

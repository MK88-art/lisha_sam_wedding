"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import {
  ArrowDown,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Palette,
  HelpCircle,
  MapPin,
  Menu,
  Navigation,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const heroSlides = [
  {
    src: "/wedding-slide-1.jpg",
  },
  {
    src: "/wedding-slide-2.jpg",
  },
  {
    src: "/wedding-slide-3.jpg",
  },
  {
    src: "/wedding-slide-4.jpg",
  },
  {
    src: "/wedding-slide-5.jpg",
  },
  {
    src: "/wedding-slide-6.jpg",
  },
  {
    src: "/wedding-slide-7.jpg",
  },
  {
    src: "/wedding-slide-8.jpg",
  },
  {
    src: "/wedding-slide-9.jpg",
  },
  {
    src: "/wedding-slide-10.jpg",
  },
  {
    src: "/wedding-slide-11.jpg",
  },
  {
    src: "/wedding-slide-12.jpg",
  },
];

const journalChapters = [
  {
    title: "The First Hello",
    subtitle: "Every beautiful story starts somewhere.",
    story:
      "Somewhere between ordinary days and unexpected moments, two paths crossed. What seemed like a simple conversation would become the beginning of something extraordinary...",
    photos: ["/wedding-slide-2.jpg"],
  },
  {
    title: "A Spark Was Born",
    subtitle: "When strangers became something more.",
    story:
      "A simple conversation gave birth to more of them..The conversations became memories, and slowly, something special began to take shape. Without even knowing it, we were writing the first pages of our story.",
    photos: ["/memo.jpg"],
  },
  {
    title: "Getting to Know You",
    subtitle: "Discovering the little things that made us us.",
    story:
      "Through laughter, shared dreams, interests and tastes, endless conversations and little adventures, we discovered that happiness wasn't just about where we were going, but who we were going there with.",
    photos: [
      "/wedding-slide-3.jpg",
      "/wedding-slide-10.jpg",
      "/wedding-slide-11.jpg",
      "/wedding-slide-4.jpg",
      
    ],
  },
  {
    title: "Falling in Love",
    subtitle: "And suddenly, everything made sense.",
    story:
      "Somewhere along the way, friendship became affection, affection became love, and the thought of doing life together became a shared desire.",
    photos: ["/wedding-slide-9.jpg"],
  },
  {
    title: "Building Our Forever",
    subtitle: "Growing together, one moment at a time.",
    story:
      "Not every chapter was perfect, but every moment brought us closer. We learned, grew, supported each other and discovered that true love is found in choosing one another, every single day.",
    photos: ["/wedding-slide-1.jpg"],
  },
  {
    title: "The Beautiful Yes !",
    subtitle: "One question. A lifetime of answers.",
    story:
      "With hearts full of love and dreams of everything still to come, we made a promise to turn our shared tomorrow into a lifetime. And just like that, forever had a beginning.",
    photos: [
      "/wedding-slide-12.jpg",
      "/wedding-slide-5.jpg",
      "/wedding-slide-6.jpg",
      "/wedding-slide-7.jpg",
    ],
  },
  {
    title: "Our Forever Begins..",
    subtitle: "The next chapter starts here.",
    story:
      "Today, surrounded by the people who mean the most to us, we celebrate more than a wedding. We celebrate every moment that brought us here and the beautiful lifetime waiting ahead. Our greatest adventure begins!",
    photos: ["/memo-2.jpg"],
  },
];

const petals = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 9) * 0.9}s`,
  duration: `${9 + (index % 5) * 1.4}s`,
  size: `${8 + (index % 4) * 3}px`,
}));

const details = [
  {
    icon: CalendarDays,
    label: "Saturday, December 19, 2026",
    detail: "The ceremony begins at 10:00 AM",
  },
  { icon: MapPin, label: "Goshen Inspirational Park", detail: "Hatfield" },
  {
    icon: Palette,
    label: "Formal & glamorous",
    detail: "Dress to impress and to dance",
  },
];

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guestStatus, setGuestStatus] = useState("");
  const [bringingPlusOne, setBringingPlusOne] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryCode | "">("");
  const [phoneCountries, setPhoneCountries] = useState<
    Array<{ country: CountryCode; name: string; callingCode: string }>
  >([]);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [musicOn, setMusicOn] = useState(false);
  const [activeJournal, setActiveJournal] = useState(0);
  const journalTouchStart = useRef<{ x: number; y: number } | null>(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!expandedImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedImage(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [expandedImage]);

  useEffect(() => {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    const countries = getCountries()
      .map((country) => ({
        country,
        name: regionNames.of(country) || country,
        callingCode: getCountryCallingCode(country),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setPhoneCountries(countries);
    setPhoneCountry("ZW");
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(2026, 11, 19, 10, 0, 0).getTime();
      const difference = Math.max(0, target - Date.now());
      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;
    const startMusic = () => {
      audio
        .play()
        .then(() => {
          setMusicOn(true);
          window.removeEventListener("pointerdown", startMusic);
          window.removeEventListener("keydown", startMusic);
        })
        .catch(() => setMusicOn(false));
    };

    const onAutoplayBlocked = () => {
      window.addEventListener("pointerdown", startMusic);
      window.addEventListener("keydown", startMusic);
    };

    audio
      .play()
      .then(() => setMusicOn(true))
      .catch(() => {
        setMusicOn(false);
        onAutoplayBlocked();
      });

    return () => {
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => setMusicOn(false));
    }
  };

  return (
    <>
    <main className="min-h-screen overflow-hidden bg-[#f8f5ef] text-[#24342f]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#182c28]/70 via-[#182c28]/35 to-transparent"
          aria-hidden="true"
        />
        <nav
          className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10"
          aria-label="Main navigation"
        >
          <a href="#top" className="inline-flex shrink-0 items-center">
            <img
              src="/tne-white-logo.png"
              alt="Elishama and Tadiwanashe wedding logo"
              className="h-20 w-auto object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.75)] md:h-24 lg:h-32"
            />
          </a>

          <div className="hidden flex-1 items-center justify-center gap-4 whitespace-nowrap text-sm font-medium uppercase tracking-[0.2em] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)] md:flex lg:gap-9">
            <a
              className="underline decoration-1 underline-offset-8 transition-opacity hover:opacity-60"
              href="#our-story"
            >
              Our story
            </a>
            <a
              className="underline decoration-1 underline-offset-8 transition-opacity hover:opacity-60"
              href="#love-journal"
            >
              Details
            </a>
            <a
              className="underline decoration-1 underline-offset-8 transition-opacity hover:opacity-60"
              href="#rsvp"
            >
              RSVP
            </a>
          </div>

          <a
            href="#rsvp"
            className="hidden shrink-0 whitespace-nowrap rounded-full border-1 border-white px-5 py-2.5 text-sm font-medium uppercase tracking-[0.18em] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)] transition-colors hover:bg-white hover:text-[#24342f] lg:block"
          >
            Kindly reply
          </a>
          <button
            className="text-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </nav>
        {menuOpen && (
          <div className="mx-4 flex flex-col gap-5 rounded-2xl bg-[#24342f] p-6 text-sm font-semibold uppercase tracking-[0.2em] text-white md:hidden">
            <a href="#our-story" onClick={() => setMenuOpen(false)}>
              Our story
            </a>
            <a href="#details" onClick={() => setMenuOpen(false)}>
              Details
            </a>
            <a href="#rsvp" onClick={() => setMenuOpen(false)}>
              RSVP
            </a>
          </div>
        )}
      </header>

      <section
        id="top"
        className="relative flex min-h-[720px] flex-col items-start overflow-hidden bg-[#52645b] pb-14 pt-36 sm:pb-16 sm:pt-40 lg:min-h-[800px] lg:pb-24 lg:pt-52"
      >
        <img
          src="/wedding-hero.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#182c28]/75 via-[#24342f]/10 to-[#24342f]/20" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#182c28]/55 via-[#182c28]/25 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {petals.map((petal) => (
            <span
              key={petal.id}
              className="wedding-petal absolute -top-8 rounded-[70%_30%_70%_30%] bg-[#f8d7c7]/75 shadow-sm"
              style={{
                left: petal.left,
                width: petal.size,
                height: `calc(${petal.size} * 0.7)`,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 text-white lg:px-10">
          <p className="mb-5 text-medium font-light uppercase tracking-[0.32em] text-white drop-shadow-xl font-italic">
            We&apos;re getting married !
          </p>
          <div>
            <h1 className="relative flex max-w-3xl flex-col items-start font-serif text-[3.5rem] leading-[0.88] tracking-[-0.045em] text-white drop-shadow-[0_3px_5px_rgba(0,0,0,0.75)] sm:text-7xl lg:text-[5.5rem]">
              {" "}
              <span>
                Tadiwanashe
                <br />
                W.G. Samuel
              </span>
              <span className="px-[6rem] font-light italic sm:py-5 lg:py-6">
                &amp;
              </span>
              <span>
                Elishama
                <br />
                <span className="text-[2.5rem] font-light italic sm:text-5xl lg:text-[3.5rem]">
                  "Marshmallow"
                </span>
                <br />
                Chipare
              </span>
            </h1>
          </div>
          <div className="mt-auto flex items-center gap-3 pt-7 font-semibold text-white drop-shadow-md sm:gap-4 sm:text-sm lg:mt-9 lg:pt-0">
            <span className="h-px w-8 bg-white/60 sm:w-12" />
            <span className="text-2xl">December 19, 2026</span>{" "}
            <span className="h-px w-8 bg-white/60 sm:w-12" />
          </div>
        </div>
        <a
          href="#our-story"
          className="absolute bottom-7 right-6 hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-white drop-shadow-md lg:flex"
        >
          Scroll to explore <ArrowDown className="size-4" />
        </a>
      </section>

      <section
        id="our-story"
        className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24 lg:px-10 lg:py-32"
      >
        <div>
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
            A little bit about us
          </p>
          <h2 className="max-w-lg font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-[#24342f] sm:text-6xl">
            The beginning of our <span className="italic">forever.</span>
          </h2>
        </div>
        <div className="max-w-xl">
          <p className="font-serif text-2xl leading-[1.35] text-[#53645d]">
            Every love story has its own beginning, its unexpected turns, and
            its moments that change everything. Ours has brought us to this
            beautiful day, where forever feels less like a promise and more like
            the most natural thing in the world.
          </p>
          <p className="mt-6 text-sm leading-7 text-[#6d7770]">
            Now, we&apos;re gathering the people we love most to celebrate this
            next chapter. We can&apos;t wait to share a little bit of our
            favorite place with you.
          </p>
          <a
            href="#love-journal"
            className="mt-8 inline-flex items-center gap-2 border-b border-[#a06b58] pb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#a06b58]"
          >
            Join us <ChevronRight className="size-4" />
          </a>
        </div>
      </section>

      <section
        id="love-journal"
        className="bg-[#f1ede5] px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
              Our love journal
            </p>
            <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-[#24342f] sm:text-6xl">
              Our Journey <span className="italic">Together</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#6d7770]">
              Seven chapters, a thousand little moments, and one beautiful
              story. Turn the pages and journey through our story.
            </p>
          </div>

          <div className="mx-auto max-w-5xl [perspective:1800px]">
            {(() => {
              const chapter = journalChapters[activeJournal];
              return (
                <article
                  key={activeJournal}
                  aria-live="polite"
                  aria-label={`Chapter ${activeJournal + 1}: ${chapter.title}`}
                  onTouchStart={(event) => {
                    const touch = event.touches[0];
                    journalTouchStart.current = {
                      x: touch.clientX,
                      y: touch.clientY,
                    };
                  }}
                  onTouchEnd={(event) => {
                    const start = journalTouchStart.current;
                    journalTouchStart.current = null;
                    if (!start) return;

                    const touch = event.changedTouches[0];
                    const deltaX = touch.clientX - start.x;
                    const deltaY = touch.clientY - start.y;
                    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) {
                      return;
                    }

                    setActiveJournal(
                      (current) =>
                        (current + (deltaX < 0 ? 1 : -1) + journalChapters.length) %
                        journalChapters.length,
                    );
                  }}
                  className="journal-page-flip touch-pan-y grid overflow-hidden border border-[#d6cbb9] bg-[#fbf8f2] shadow-[0_28px_70px_rgba(54,34,27,0.18)] md:min-h-[470px] md:grid-cols-2"
                >
                  <div className="flex flex-col justify-center border-b border-[#e1d8ca] p-7 sm:p-10 md:border-b-0 md:border-r md:p-12 lg:p-16">
                    <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#a06b58]">
                      Chapter {String(activeJournal + 1).padStart(2, "0")}{" "}
                      <span className="px-2 text-[#c8b9a2]">/</span>{" "}
                      {String(journalChapters.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-7 font-serif text-4xl leading-[0.98] tracking-[-0.03em] text-[#24342f] sm:text-5xl">
                      {chapter.title}
                    </h3>
                    <p className="mt-4 font-serif text-xl italic leading-snug text-[#8b6759] sm:text-2xl">
                      {chapter.subtitle}
                    </p>
                    <p className="mt-6 text-sm leading-7 text-[#6d7770] sm:text-base">
                      {chapter.story}
                    </p>
                  </div>
                  <div
                    className={`grid min-h-[300px] auto-rows-fr gap-1.5 bg-[#e6dfd3] p-2.5 sm:min-h-[390px] sm:p-4 ${
                      chapter.photos.length === 1
                        ? "grid-cols-1"
                        : "grid-cols-2"
                    }`}
                  >
                    {chapter.photos.map((src, index) => (
                      <div
                        key={src}
                        className={`min-h-0 overflow-hidden bg-[#d6cbb9] ${
                          chapter.photos.length === 3 && index === 0
                            ? "row-span-2"
                            : ""
                        }`}
                      >
                        <img
                          src={src}
                          alt={`${chapter.title} — memory ${index + 1}`}
                          className="size-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                </article>
              );
            })()}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setActiveJournal(
                    (current) =>
                      (current - 1 + journalChapters.length) %
                      journalChapters.length,
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-[#bcae9a] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#53645d] transition-colors hover:bg-[#e8e0d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a06b58]"
                aria-label="Turn to the previous chapter"
                title="Previous chapter"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div
                className="flex items-center gap-2"
                role="group"
                aria-label="Choose a journal chapter"
              >
                {journalChapters.map((chapter, index) => (
                  <button
                    key={chapter.title}
                    type="button"
                    onClick={() => setActiveJournal(index)}
                    aria-label={`Go to chapter ${index + 1}: ${chapter.title}`}
                    aria-current={activeJournal === index ? "step" : undefined}
                    className={`size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a06b58] focus-visible:ring-offset-2 ${
                      activeJournal === index
                        ? "bg-[#a06b58]"
                        : "bg-[#c8b9a2] hover:bg-[#8b6759]"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setActiveJournal(
                    (current) => (current + 1) % journalChapters.length,
                  )
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#24342f] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#f8f5ef] transition-colors hover:bg-[#53645d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a06b58] focus-visible:ring-offset-2"
                aria-label="Turn to the next chapter"
                title="Next chapter"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="details"
        className="bg-[#e8e4d9] px-6 py-24 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
                The details
              </p>
              <h2 className="font-serif text-5xl tracking-[-0.03em] text-[#24342f] sm:text-6xl">
                Meet us in the garden
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#6d7770]">
              Join us for a beautiful day of ceremony, celebration, games, and
              an after party — all part of the wedding in one day.
            </p>
          </div>
          <div className="grid border-t border-[#c8c5bb] md:grid-cols-3">
            {details.map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="flex gap-5 border-b border-[#c8c5bb] py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
              >
                <Icon
                  className="mt-1 size-5 shrink-0 text-[#a06b58]"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-serif text-xl text-[#24342f]">{label}</p>
                  <p className="mt-2 text-sm text-[#6d7770]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 grid items-center gap-8 border-t border-[#c8c5bb] pt-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="max-w-sm">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
                Attire &amp; palette
              </p>
              <h3 className="font-serif text-4xl leading-[0.98] tracking-[-0.03em] text-[#24342f] sm:text-5xl">
                Formal.
                <br />
                Elegant.
                <br />
                <span className="italic">Timeless.</span>
              </h3>
              <p className="mt-5 text-sm leading-7 text-[#6d7770]">
                Dress to impress and to dance. We invite you to choose from our
                wedding colours and make the palette your own.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  ["Burgundy", "#751729"],
                  ["Black", "#242321"],
                  ["Gold", "#b58a43"],
                  ["Champagne", "#d9b895"],
                  ["Ivory", "#f7f0e2"],
                ].map(([colour, value]) => (
                  <span
                    key={colour}
                    title={colour}
                    aria-label={colour}
                    className="size-7 rounded-full border border-[#24342f]/15 shadow-sm"
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#8a8175]">
                Burgundy · Black · Gold · Champagne · Ivory
              </p>
            </div>
            <figure className="mx-auto w-full max-w-2xl rotate-[0.4deg] rounded-sm bg-[#fbf8f2] p-2.5 shadow-[0_24px_55px_rgba(54,34,27,0.16)] ring-1 ring-[#b99b6b]/35 sm:p-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedImage({
                    src: "/pallet-A.jpg",
                    alt: "Wedding attire guide with formal outfit inspiration and the burgundy, black, gold, champagne, and ivory colour palette",
                  })
                }
                aria-label="View the wedding attire guide full screen"
                className="group relative block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a06b58]"
              >
                <img
                  src="/pallet-A.jpg"
                  alt="Wedding attire guide with formal outfit inspiration and the burgundy, black, gold, champagne, and ivory colour palette"
                  className="h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-[#24342f]/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  View full screen
                </span>
              </button>
              <figcaption className="px-2 pb-1 pt-3 text-center font-serif text-sm italic tracking-wide text-[#72514a]">
                A little guide for celebrating in style
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="rsvp"
        className="bg-[#24342f] px-6 py-24 text-[#f8f5ef] lg:px-10 lg:py-32"
      >
        <div className="mx-auto grid min-w-0 max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28">
          <div className="min-w-0">
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#d7a58d]">
              Will you join us?
            </p>
            <h2 className="w-full max-w-full font-serif text-5xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              We hope
              <br />
              you can <span className="italic">make it.</span>
            </h2>
            <p className="mt-8 max-w-xs text-sm leading-6 text-white/60">
              Please reply by 30 November 2026. Married guests may list their
              spouse on the RSVP form; single guests cannot add a plus one.
              <br />
              <br />
            </p>
          </div>
          {submitted ? (
            <div className="flex min-h-72 flex-col items-start justify-center border-t border-white/20">
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#d7a58d] text-[#24342f]">
                <Check />
              </div>
              <h3 className="font-serif text-4xl">Response saved.</h3>
              <p className="mt-3 text-sm text-white/60">
                Thank you for letting us know.{" "}
                {confirmationEmailSent
                  ? "A confirmation email has been sent to the address you provided. Check your inbox (and spam folder) for details."
                  : "Your RSVP was saved, but we couldn’t send a confirmation email. Please check your email address or contact us."}
              </p>
            </div>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setRsvpSubmitting(true);
                setRsvpError("");

                const formData = new FormData(event.currentTarget);
                const selectedCountryCode = String(
                  formData.get("phoneCountry"),
                );
                const selectedPhoneCountry = phoneCountries.find(
                  ({ country }) => country === selectedCountryCode,
                );
                if (!selectedPhoneCountry) {
                  setRsvpError("Please select a country calling code.");
                  setRsvpSubmitting(false);
                  return;
                }
                const nationalPhoneNumber = String(formData.get("phoneNumber"))
                  .replace(/\D/g, "")
                  .replace(/^0+/, "");
                const payload = {
                  name: formData.get("name"),
                  guestStatus: formData.get("guestStatus"),
                  bringingPlusOne:
                    guestStatus === "married" ? bringingPlusOne : "no",
                  plusOne: formData.get("plusOne"),
                  attendance: formData.get("attendance"),
                  phone: `+${selectedPhoneCountry.callingCode}${nationalPhoneNumber}`,
                  email: formData.get("email"),
                };

                try {
                  const response = await fetch(
                    process.env.NEXT_PUBLIC_RSVP_API_URL || "/api/rsvps.php",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    },
                  );
                  const responseBody = await response.text();
                  let result: {
                    error?: string;
                    success?: boolean;
                    emailSent?: boolean;
                  };

                  try {
                    result = JSON.parse(responseBody);
                  } catch {
                    throw new Error(
                      `The RSVP server returned an unexpected response (HTTP ${response.status}). Please try again later.`,
                    );
                  }

                  if (!response.ok) {
                    throw new Error(result.error || "Unable to submit RSVP.");
                  }

                  setConfirmationEmailSent(result.emailSent === true);
                  setSubmitted(true);
                } catch (error) {
                  setRsvpError(
                    error instanceof Error
                      ? error.message
                      : "Unable to submit RSVP. Please try again.",
                  );
                } finally {
                  setRsvpSubmitting(false);
                }
              }}
              className="grid w-full min-w-0 max-w-xl grid-cols-[minmax(0,1fr)] gap-6 border-t border-white/20 pt-8 [&>*]:min-w-0"
            >
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Your name
                <input
                  required
                  name="name"
                  className="w-full min-w-0 border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white/50 outline-none placeholder:text-white/25 focus:border-[#d7a58d]"
                  placeholder="First and last name"
                />
              </label>
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Are you married or single?
                <select
                  required
                  name="guestStatus"
                  value={guestStatus}
                  onChange={(event) => {
                    setGuestStatus(event.target.value);
                    setBringingPlusOne("");
                  }}
                  className="w-full min-w-0 border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-text-white/50 outline-none focus:border-[#d7a58d]"
                >
                  <option value="" disabled className="text-[#24342f]">
                    Select your status
                  </option>
                  <option value="married" className="text-[#24342f]">
                    Married
                  </option>
                  <option value="single" className="text-[#24342f]">
                    Single
                  </option>
                </select>
              </label>
              {guestStatus === "married" && (
                <>
                  <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                    Are you coming with a plus one?
                    <select
                      required
                      name="bringingPlusOne"
                      value={bringingPlusOne}
                      onChange={(event) =>
                        setBringingPlusOne(event.target.value)
                      }
                      className="w-full min-w-0 border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white/50 outline-none focus:border-[#d7a58d]"
                    >
                      <option value="" disabled className="text-[#24342f]">
                        Select an answer
                      </option>
                      <option value="yes" className="text-[#24342f]">
                        Yes
                      </option>
                      <option value="no" className="text-[#24342f]">
                        No
                      </option>
                    </select>
                  </label>
                  {bringingPlusOne === "yes" && (
                    <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                      Spouse&apos;s name
                      <input
                        required
                        name="plusOne"
                        className="w-full min-w-0 border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white/50 outline-none placeholder:text-white/25 focus:border-[#d7a58d]"
                        placeholder="First and last name"
                      />
                    </label>
                  )}
                </>
              )}
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Will you be joining us?
                <select
                  name="attendance"
                  className="w-full min-w-0 border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white/50 outline-none focus:border-[#d7a58d]"
                >
                  <option value="Joyfully accept" className="text-[#24342f]">
                    Joyfully accept
                  </option>
                  <option
                    value="Regretfully decline"
                    className="text-[#24342f]"
                  >
                    Regretfully decline
                  </option>
                </select>
              </label>
              <div className="grid gap-2">
                <label
                  htmlFor="phoneNumber"
                  className="text-[11px] uppercase tracking-[0.2em] text-white/60"
                >
                  Phone number
                </label>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                  <label className="sr-only" htmlFor="phoneCountry">
                    Country calling code
                  </label>
                  <select
                    required
                    id="phoneCountry"
                    name="phoneCountry"
                    value={phoneCountry}
                    onChange={(event) => {
                      const selectedCountry = phoneCountries.find(
                        ({ country }) => country === event.target.value,
                      );
                      if (selectedCountry) {
                        setPhoneCountry(selectedCountry.country);
                      }
                    }}
                    className="w-full border-b border-white/30 bg-transparent py-3 font-serif text-lg normal-case tracking-normal text-white/50 outline-none focus:border-[#d7a58d] sm:w-auto sm:max-w-[55%] sm:text-xl"
                  >
                    {phoneCountries.length === 0 && (
                      <option value="" disabled>
                        Loading country codes...
                      </option>
                    )}
                    {phoneCountries.map(({ country, name, callingCode }) => (
                      <option
                        key={country}
                        value={country}
                        className="text-[#24342f]"
                      >
                        {name} (+{callingCode})
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    inputMode="tel"
                    autoComplete="tel-national"
                    pattern="[0-9\s().-]{4,20}"
                    title="Enter your phone number without the country code."
                    className="w-full min-w-0 flex-1 border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white/50 outline-none placeholder:text-white/25 focus:border-[#d7a58d]"
                    placeholder="781 234 567"
                  />
                </div>
                <p className="text-xs text-white/45">
                  Choose your country code and enter the number without its
                  leading zero.
                </p>
              </div>
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Email address
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full min-w-0 border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white/50 outline-none placeholder:text-white/25 focus:border-[#d7a58d]"
                  placeholder="you@example.com"
                />
              </label>
              <button
                type="submit"
                disabled={rsvpSubmitting || phoneCountries.length === 0}
                className="mt-4 flex w-fit items-center gap-3 rounded-full bg-[#d7a58d] px-7 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#24342f] transition-transform hover:scale-[1.02]"
              >
                {rsvpSubmitting ? "Sending..." : "Send my RSVP"}{" "}
                <ChevronRight className="size-4" />
              </button>
              {rsvpError && (
                <p role="alert" className="text-sm text-red-300">
                  {rsvpError}
                </p>
              )}
            </form>
          )}
          <p className="text-lg">
            OR RSVP to:
            <br />
            <strong>Eliasaph: +263 781 203 104</strong><br/>
            <strong>R Nkomo: +263 772 841 939 </strong>
          </p>
        </div>
      </section>

      <section
        id="wedding-day"
        className="bg-[#24342f] px-6 py-24 text-[#f8f5ef] lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#d7a58d]">
                The wedding day
              </p>
              <h2 className="font-serif text-5xl tracking-[-0.03em] sm:text-6xl">
                A whole day to celebrate.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/60">
              Come ready for every beautiful moment, from the first hello to the
              last dance.
            </p>
          </div>
          <div className="grid border-t border-white/20 md:grid-cols-4">
            {[
              ["10:00 AM", "Ceremony", "Goshen Inspirational Park"],
              ["12:00 PM", "Celebration", "Food, laughter, and photographs"],
              ["3:00 PM", "Games", "A little friendly competition"],
              ["6:00 PM", "After party", "Dance with us into the evening"],
            ].map(([time, title, detail]) => (
              <div
                key={time}
                className="border-b border-white/20 py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"
              >
                <p className="font-serif text-3xl text-[#d7a58d]">{time}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em]">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="good-to-know"
        className="bg-[#e8e4d9] px-6 py-24 lg:px-10 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
              Good to know
            </p>
            <h2 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-[#24342f] sm:text-6xl">
              A few helpful <span className="italic">notes.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#6d7770]">
              Everything you need for a joyful, comfortable day with us.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border-t border-[#c8c5bb] pt-5">
              <Navigation
                className="mb-5 size-5 text-[#a06b58]"
                strokeWidth={1.5}
              />
              <h3 className="font-serif text-2xl text-[#24342f]">
                Getting there
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6d7770]">
                From Harare CBD, take Seke Road southeast towards Hatfield.
                Follow local signs to Goshen Inspiration Park, 8 Fern Road. You
                can also see{" "}
                <a
                  className="text-blue-600 text-underline hover:opacity-60"
                  href="#venue-map"
                >
                  googlemaps below..
                </a>
              </p>
            </div>
            <div className="border-t border-[#c8c5bb] pt-5">
              <HelpCircle
                className="mb-5 size-5 text-[#a06b58]"
                strokeWidth={1.5}
              />
              <h3 className="font-serif text-2xl text-[#24342f]">
                The little details
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6d7770]">
                Formal and glamorous — dress to impress and to dance. Married
                couples are welcome to bring a plus one; singles have separate
                invites. Strictly no children allowed.
              </p>
              <figure className="mx-auto mt-6 w-full max-w-xs rounded-sm bg-[#fbf8f2] p-2.5 shadow-[0_16px_35px_rgba(54,34,27,0.14)] ring-1 ring-[#b99b6b]/35">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedImage({
                      src: "/pallet-B.jpg",
                      alt: "Wedding colour palette inspiration in burgundy, black, gold, champagne, and ivory",
                    })
                  }
                  aria-label="View the wedding colour palette full screen"
                  className="group relative block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a06b58]"
                >
                  <img
                    src="/pallet-B.jpg"
                    alt="Wedding colour palette inspiration in burgundy, black, gold, champagne, and ivory"
                    className="h-auto w-full"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#24342f]/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    View full screen
                  </span>
                </button>
                <figcaption className="px-2 pb-1 pt-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6d55]">
                  Colour inspiration
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section
        id="venue-map"
        className="bg-[#f1ede5] px-6 py-20 text-center lg:px-10 lg:py-24"
      >
        <div className="mx-auto mb-8 max-w-7xl">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
            Find us
          </p>
          <h2 className="font-serif text-4xl tracking-[-0.03em] text-[#24342f] sm:text-5xl">
            Goshen Inspirational Park
          </h2>
          <p className="mt-3 text-sm text-[#6d7770]">Hatfield</p>
        </div>
        <div className="mx-auto w-full overflow-hidden rounded-2xl border border-[#c8c5bb] shadow-sm lg:w-3/4">
          <iframe
            title="Map to Goshen Inspirational Park"
            src="https://maps.google.com/maps?q=Goshen%20Inspiration%20Park&output=embed"
            className="h-[320px] w-full border-0 sm:h-[400px] lg:h-[480px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section
        aria-label="Countdown to the wedding"
        className="bg-[#f8f5ef] px-6 py-20 text-center lg:px-10 lg:py-24"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
          Counting down to forever
        </p>
        <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-[#24342f] sm:text-5xl">
          See you at the altar
        </h2>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-4 divide-x divide-[#d8d1c5] border-y border-[#d8d1c5] py-6">
          {Object.entries(countdown).map(([unit, value]) => (
            <div key={unit} className="px-2 sm:px-5">
              <p className="font-serif text-4xl text-[#24342f] sm:text-5xl">
                {String(value).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.2em] text-[#8a918a]">
                {unit}
              </p>
            </div>
          ))}
        </div>
      </section>

      <audio
        ref={audioRef}
        src="/wedding-piano.mp3"
        autoPlay
        loop
        preload="auto"
        aria-label="Soft piano background music"
      />
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={musicOn ? "Turn music off" : "Turn music on"}
        aria-pressed={musicOn}
        className="fixed bottom-6 right-6 z-30 flex size-12 items-center justify-center rounded-full border border-[#d7a58d]/50 bg-[#24342f] text-[#f8f5ef] shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a58d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f5ef]"
      >
        {musicOn ? (
          <Volume2 data-icon="inline-start" />
        ) : (
          <VolumeX data-icon="inline-start" />
        )}
      </button>
      <footer className="flex flex-col items-center gap-4 bg-[#f8f5ef] px-6 py-12 text-center">
        <img
          src="/tne-black-logo.png"
          alt="Elishama and Tadiwanashe wedding logo"
          className="h-32 w-auto object-contain"
        />
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#8a918a]">
          Come celebrate with us · December 19, 2026
        </p>
      </footer>
    </main>
      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen image preview"
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171411]/95 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            onClick={() => setExpandedImage(null)}
            aria-label="Close full-screen image"
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a58d] sm:right-6 sm:top-6"
          >
            <X className="size-5" />
          </button>
          <img
            src={expandedImage.src}
            alt={expandedImage.alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-2rem)] max-w-full object-contain shadow-2xl sm:max-h-[calc(100vh-4rem)]"
          />
        </div>
      )}
    </>
  );
}

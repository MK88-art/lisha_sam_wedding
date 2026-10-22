"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Gift,
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
];

const journalSlides = [
  ...heroSlides,
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20261020-WA0048-MrpChoz32kUukYNLK2mKDPYeVROXmd.jpg",
  
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
  { icon: MapPin, label: "Goshen Wedding Centre", detail: "Hatfield" },
  {
    icon: Clock3,
    label: "Formal & glamorous",
    detail: "Dress to impress and to dance",
  },
];

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [activeJournal, setActiveJournal] = useState(0);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

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
    audio
      .play()
      .then(() => setMusicOn(true))
      .catch(() => {
        // Browsers may block audible autoplay until the visitor interacts.
        setMusicOn(false);
      });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveJournal((current) => (current + 3) % journalSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
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
    <main className="min-h-screen overflow-hidden bg-[#f8f5ef] text-[#24342f]">
      <header className="absolute inset-x-0 top-0 z-20">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"
          aria-label="Main navigation"
        >
          <a
            href="#top"
            className="font-serif text-2xl italic tracking-tight text-white"
          >
            E <span className="not-italic">&amp;</span> T
          </a>
          <div className="hidden items-center gap-9 text-[11px] font-medium uppercase tracking-[0.24em] text-white/90 md:flex">
            <a
              className="transition-opacity hover:opacity-60"
              href="#our-story"
            >
              Our story
            </a>
            <a className="transition-opacity hover:opacity-60" href="#details">
              Details
            </a>
            <a className="transition-opacity hover:opacity-60" href="#rsvp">
              RSVP
            </a>
          </div>
          <a
            href="#rsvp"
            className="hidden rounded-full border border-white/70 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-[#24342f] md:block"
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
          <div className="mx-4 flex flex-col gap-5 rounded-2xl bg-[#24342f] p-6 text-sm uppercase tracking-[0.2em] text-white md:hidden">
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
        className="relative flex min-h-[720px] items-end overflow-hidden bg-[#52645b] pb-14 pt-36 sm:pb-16 sm:pt-32 lg:min-h-[800px] lg:pb-24"
      >
        <img
          src="/wedding-hero.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#182c28]/75 via-[#24342f]/10 to-[#24342f]/20" />
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
        <div className="relative mx-auto w-full max-w-7xl px-6 text-white lg:px-10">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.32em] text-white/80">
            We&apos;re getting married
          </p>
          <h1 className="flex max-w-3xl flex-col items-start font-serif text-[3.35rem] leading-[0.9] tracking-[-0.045em] sm:text-8xl lg:text-[10rem]">
            <span>Elishama</span>
            <span className="font-light italic">&amp;</span>
            <span>Tadiwanashe W.G. Samuel</span>
          </h1>
          <div className="mt-7 flex items-center gap-3 text-xs text-white/90 sm:mt-9 sm:gap-4 sm:text-sm">
            <span className="h-px w-8 bg-white/60 sm:w-12" />
            December 19, 2026 <span className="h-px w-8 bg-white/60 sm:w-12" />
          </div>
        </div>
        <a
          href="#our-story"
          className="absolute bottom-7 right-6 hidden items-center gap-3 text-[10px] uppercase tracking-[0.26em] text-white/80 lg:flex"
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
            What started as a missed train in Brooklyn turned into long walks,
            Sunday dinners, and a life we never want to stop building together.
          </p>
          <p className="mt-6 text-sm leading-7 text-[#6d7770]">
            Now, we&apos;re gathering the people we love most to celebrate this
            next chapter. We can&apos;t wait to share a little bit of our
            favorite place with you.
          </p>
          <a
            href="#details"
            className="mt-8 inline-flex items-center gap-2 border-b border-[#a06b58] pb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#a06b58]"
          >
            Join us <ChevronRight className="size-4" />
          </a>
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
        </div>
      </section>

      <section
        id="rsvp"
        className="bg-[#24342f] px-6 py-24 text-[#f8f5ef] lg:px-10 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28">
          <div>
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#d7a58d]">
              Will you join us?
            </p>
            <h2 className="font-serif text-6xl leading-[0.9] tracking-[-0.04em] sm:text-7xl">
              We hope
              <br />
              you can <span className="italic">make it.</span>
            </h2>
            <p className="mt-8 max-w-xs text-sm leading-6 text-white/60">
              Please reply by 30 November 2026. Plus ones are welcome for
              married couples; singles have separate invites.
              <br />
              <br />
              RSVP to Mrs Chipare: +263 77 226 8080
              <br />
              elishama.chipare@gmail.com
            </p>
          </div>
          {submitted ? (
            <div className="flex min-h-72 flex-col items-start justify-center border-t border-white/20">
              <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#d7a58d] text-[#24342f]">
                <Check />
              </div>
              <h3 className="font-serif text-4xl">You&apos;re on the list.</h3>
              <p className="mt-3 text-sm text-white/60">
                Thank you for letting us know. We can&apos;t wait to celebrate
                with you.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
              className="grid max-w-xl gap-6 border-t border-white/20 pt-8"
            >
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Your name
                <input
                  required
                  name="name"
                  className="border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#d7a58d]"
                  placeholder="First and last name"
                />
              </label>
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Will you be joining us?
                <select
                  name="attendance"
                  className="border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white outline-none focus:border-[#d7a58d]"
                >
                  <option className="text-[#24342f]">Joyfully accepts</option>
                  <option className="text-[#24342f]">
                    Regretfully declines
                  </option>
                </select>
              </label>
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Phone number
                <input
                  required
                  type="tel"
                  name="phone"
                  className="border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#d7a58d]"
                  placeholder="(555) 123-4567"
                />
              </label>
              <label className="grid gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                Email address
                <input
                  required
                  type="email"
                  name="email"
                  className="border-b border-white/30 bg-transparent py-3 font-serif text-2xl normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#d7a58d]"
                  placeholder="you@example.com"
                />
              </label>
              <button
                type="submit"
                className="mt-4 flex w-fit items-center gap-3 rounded-full bg-[#d7a58d] px-7 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#24342f] transition-transform hover:scale-[1.02]"
              >
                Send my RSVP <ChevronRight className="size-4" />
              </button>
            </form>
          )}
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
              ["10:00 AM", "Ceremony", "Goshen Wedding Centre"],
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
                Goshen Wedding Centre, Hatfield. Add the venue to your map
                before the day and plan to arrive early.
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
                invites.
              </p>
            </div>
            <div className="border-t border-[#c8c5bb] pt-5 sm:col-span-2">
              <Gift className="mb-5 size-5 text-[#a06b58]" strokeWidth={1.5} />
              <h3 className="font-serif text-2xl text-[#24342f]">
                Your presence is the present
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#6d7770]">
                The greatest gift is celebrating this day with us. Come with
                your dancing shoes, your appetite, and your favorite memories of
                the couple.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="love-journal"
        className="bg-[#f1ede5] px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-20">
          <div>
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#a06b58]">
              Our love journal
            </p>
            <h2 className="max-w-md font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-[#24342f] sm:text-6xl">
              A few pages from our <span className="italic">story.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#6d7770]">
              Glimpses of the laughter, milestones, and moments that brought us
              here.
            </p>
          </div>
          <div
            className="relative min-h-[430px] sm:min-h-[520px]"
            aria-label="A floating slideshow of memories"
          >
            {Array.from({ length: 3 }, (_, index) => {
              const slide =
                journalSlides[(activeJournal + index) % journalSlides.length];
              const positions = [
                "left-[4%] top-[6%] rotate-[-5deg]",
                "right-[3%] top-[22%] rotate-[4deg]",
                "left-[24%] bottom-[1%] rotate-[-2deg]",
              ];
              return (
                <div
                  key={`${activeJournal}-${slide.src}`}
                  className={`journal-card absolute ${positions[index]} ${index === 0 ? "h-[62%] w-[48%]" : "h-[48%] w-[42%]"}`}
                >
                  <img
                    src={slide.src}
                    className="size-full object-cover"
                  />
                </div>
              );
            })}
          </div>
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
        <p className="font-serif text-3xl italic text-[#24342f]">
          E <span className="not-italic">&amp;</span> T
        </p>
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#8a918a]">
          Made with love · December 19, 2026
        </p>
      </footer>
    </main>
  );
}

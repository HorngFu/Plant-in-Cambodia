export default function ComingSoon() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-4 py-16">
      <div className="flex items-center gap-3 text-accent">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-9" fill="currentColor">
          <path d="M12 22c-.6 0-1-.4-1-1v-5.1C6.6 15.4 3 11.7 3 7V4a1 1 0 0 1 1-1h1c3.4 0 6.3 2 7.6 5A9 9 0 0 1 19 4h1a1 1 0 0 1 1 1v2c0 4.6-3.5 8.4-8 8.9V21c0 .6-.4 1-1 1Z" />
        </svg>
        <span className="text-sm font-semibold tracking-wide uppercase">plantincambodia.org</span>
      </div>

      <section lang="km" className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">រុក្ខជាតិនៅកម្ពុជា</h1>
        <p className="text-lg text-muted">
          បញ្ជីទិន្នន័យបើកចំហនៃរុក្ខជាតិនៅកម្ពុជា ជាភាសាខ្មែរ និងអង់គ្លេស។ ឆាប់ៗនេះ។
        </p>
      </section>

      <section lang="en" className="flex flex-col gap-3">
        <h2 className="text-3xl font-bold sm:text-4xl">Plant in Cambodia</h2>
        <p className="text-lg text-muted">
          A free, open list of the plants of Cambodia, in Khmer and English. Coming soon.
        </p>
      </section>

      <p className="border-t border-border pt-6 text-sm text-muted">
        Open source on{" "}
        <a
          className="font-medium text-accent underline underline-offset-4"
          href="https://github.com/HorngFu/Plant-in-Cambodia"
        >
          GitHub
        </a>
        . Data under CC BY 4.0.
      </p>
    </main>
  );
}

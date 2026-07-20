export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <span className="text-lg font-semibold tracking-wide">KOTHOM</span>
        <a
          href="#membership"
          className="rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-neutral-950 transition hover:bg-amber-400"
        >
          Become a Member
        </a>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Knights of the Higher Order Ministries
        </h1>
        <p className="max-w-2xl text-lg text-neutral-400">
          A ministry dedicated to faith, service, and fellowship. Join us in our
          mission — your donation supports our work and welcomes you as a
          member.
        </p>
        <a
          href="#membership"
          className="mt-4 rounded-full bg-amber-500 px-8 py-3 text-base font-medium text-neutral-950 transition hover:bg-amber-400"
        >
          Donate &amp; Join
        </a>
      </section>

      <section
        id="membership"
        className="mx-auto max-w-5xl px-6 py-24 text-center"
      >
        <h2 className="text-2xl font-semibold sm:text-3xl">Membership</h2>
        <p className="mx-auto mt-4 max-w-xl text-neutral-400">
          Membership details and secure donation options are coming soon.
        </p>
      </section>

      <footer className="border-t border-neutral-800 px-6 py-10 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} Knights of the Higher Order Ministries
      </footer>
    </main>
  );
}

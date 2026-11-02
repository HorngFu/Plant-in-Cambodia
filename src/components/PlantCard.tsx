import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/i18n/routing";
import type { Plant } from "@/lib/content";
import { commonName, pick } from "@/lib/localize";
import { IucnBadge, OriginBadge } from "./Badge";
import { LeafIcon } from "./icons";

export function PlantCard({
  plant,
  locale,
  headingLevel = 3,
}: {
  plant: Plant;
  locale: Locale;
  /** 2 when the cards sit directly under the page's h1. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const name = commonName(plant, locale);
  const summary = pick(plant.summary, locale);
  const photo = plant.images[0];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="flex aspect-[3/2] items-center justify-center bg-accent-soft">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export of pre-optimised images
          <img src={photo.file} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <LeafIcon className="size-12 text-accent opacity-40" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Heading className="flex flex-col">
          <Link
            locale={locale}
            href={`/plants/${plant.slug}`}
            className="text-lg font-semibold text-foreground group-hover:text-accent after:absolute after:inset-0"
          >
            {name ? <span lang={name.lang}>{name.text}</span> : <i>{plant.scientificName}</i>}
          </Link>
          {name && (
            <i lang="la" className="text-sm text-muted">
              {plant.scientificName}
            </i>
          )}
        </Heading>
        {locale === "km" && plant.englishName && name?.lang === "km" && (
          <p lang="en" className="-mt-1 text-sm text-muted">
            {plant.englishName}
          </p>
        )}
        {summary && (
          <p lang={summary.lang} className="line-clamp-3 text-sm text-muted">
            {summary.text}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          <IucnBadge status={plant.iucnStatus} locale={locale} />
          <OriginBadge status={plant.originStatus} locale={locale} />
        </div>
      </div>
    </article>
  );
}

export function PlantGrid({ children }: { children: React.ReactNode }) {
  return <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>;
}

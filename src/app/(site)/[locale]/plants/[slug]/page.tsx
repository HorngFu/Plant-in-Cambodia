import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge, IucnBadge, OriginBadge } from "@/components/Badge";
import { ExternalIcon, ShieldIcon, WarningIcon } from "@/components/icons";
import { LocalizedText } from "@/components/LocalizedText";
import { MarkdocContent, pickDoc } from "@/components/MarkdocContent";
import { MonthCalendar } from "@/components/MonthCalendar";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getLookups, getPlant, getPlants, type Plant } from "@/lib/content";
import { IMAGE_LICENSES } from "@/lib/content/vocab";
import { commonName, pick, placeName, plantTitle } from "@/lib/localize";
import { pageMetadata, truncate } from "@/lib/metadata";
import { REPO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

type Props = PageProps<"/[locale]/plants/[slug]">;

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPlants()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const plant = await getPlant(slug);
  if (!plant) return {};
  const summary = pick(plant.summary, locale)?.text;
  return pageMetadata({
    locale,
    path: `/plants/${slug}`,
    title: plantTitle(plant, locale),
    description: truncate(summary ?? `${plant.scientificName} ${plant.author}`.trim()),
  });
}

export default async function PlantPage({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);

  const plant = await getPlant(slug);
  if (!plant) notFound();

  const [t, vocab, lookups] = await Promise.all([
    getTranslations({ locale, namespace: "plant" }),
    getTranslations({ locale, namespace: "vocab" }),
    getLookups(),
  ]);

  const name = commonName(plant, locale);
  const family = lookups.families.get(plant.family);
  const summary = pick(plant.summary, locale);
  const toxicity = pick(plant.toxicity, locale);
  const description = pickDoc(plant.description, locale);
  const identification = pickDoc(plant.identification, locale);
  const usesNotes = pickDoc(plant.usesNotes, locale);
  const showDisclaimer =
    plant.uses.includes("medicine") || plant.uses.includes("food") || usesNotes;
  const pageUrl = `${SITE_URL}/${locale}/plants/${slug}`;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd plant={plant} familyName={family?.name} url={pageUrl} />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/plants" className="hover:underline">
          {(await getTranslations({ locale, namespace: "nav" }))("plants")}
        </Link>
        {family && (
          <>
            {" / "}
            <Link href={`/families/${family.slug}`} className="hover:underline">
              {family.name}
            </Link>
          </>
        )}
      </nav>

      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <h1 className="flex flex-col gap-1">
          {name && (
            <span lang={name.lang} className="text-3xl font-bold sm:text-4xl">
              {name.text}
            </span>
          )}
          <span className={name ? "text-xl text-muted" : "text-3xl font-bold sm:text-4xl"}>
            <i lang="la">{plant.scientificName}</i>
            {plant.author && <span className="ml-2 text-base not-italic">{plant.author}</span>}
          </span>
        </h1>
        {(plant.khmerNameLatin || (locale === "km" && plant.englishName)) && (
          <p className="text-muted">
            {[plant.khmerNameLatin, locale === "km" ? plant.englishName : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <IucnBadge status={plant.iucnStatus} locale={locale} />
          <OriginBadge status={plant.originStatus} locale={locale} />
          {plant.growthForms.map((g) => (
            <Badge key={g}>{vocab(`growthForm.${g}`)}</Badge>
          ))}
          {plant.reviewStatus === "draft" ? (
            <Badge tone="warn">{t("draft")}</Badge>
          ) : (
            plant.lastReviewed && (
              <Badge tone="ok">{t("reviewed", { date: plant.lastReviewed })}</Badge>
            )
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-10">
          {summary && <LocalizedText value={summary} locale={locale} className="text-lg" />}

          {toxicity && (
            <div role="note" className="flex gap-3 rounded-lg bg-danger-bg p-4 text-danger-fg">
              <WarningIcon className="mt-1 size-5 shrink-0" />
              <div>
                <p className="font-semibold">{t("toxicity")}</p>
                <LocalizedText value={toxicity} locale={locale} />
              </div>
            </div>
          )}

          {plant.profileLevel === "checklist" && (
            <div className="rounded-lg border border-dashed border-border p-4 text-muted">
              <p>{t("checklistNote")}</p>
              <Link
                href="/contribute"
                className="mt-1 inline-block font-medium text-accent hover:underline"
              >
                {t("helpWrite")} →
              </Link>
            </div>
          )}

          {description && (
            <Section title={t("description")}>
              <Doc doc={description} locale={locale} note={t("notTranslated")} />
            </Section>
          )}

          {identification && (
            <Section title={t("identification")}>
              <Doc doc={identification} locale={locale} note={t("notTranslated")} />
            </Section>
          )}

          {(plant.uses.length > 0 || usesNotes) && (
            <Section title={t("uses")}>
              {plant.uses.length > 0 && (
                <ul className="mb-4 flex flex-wrap gap-2">
                  {plant.uses.map((u) => (
                    <li key={u}>
                      <Badge tone="ok">{vocab(`use.${u}`)}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              {usesNotes && <Doc doc={usesNotes} locale={locale} note={t("notTranslated")} />}
              {showDisclaimer && (
                <p role="note" className="mt-4 rounded-lg bg-info-bg p-3 text-sm text-info-fg">
                  {t("medicalDisclaimer")}
                </p>
              )}
            </Section>
          )}

          <Section title={t("calendar")}>
            <MonthCalendar
              flowering={plant.floweringMonths}
              fruiting={plant.fruitingMonths}
              locale={locale}
            />
          </Section>

          {plant.images.length > 0 && (
            <Section title={t("photos")}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {plant.images.map((img) => {
                  const caption = pick(img.caption, locale);
                  const license =
                    IMAGE_LICENSES.find((x) => x.value === img.license)?.label ?? img.license;
                  return (
                    <li key={img.file}>
                      <figure className="overflow-hidden rounded-lg border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised static images */}
                        <img
                          src={img.file}
                          alt={caption?.text ?? plant.scientificName}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <figcaption className="flex flex-col gap-0.5 p-3 text-sm">
                          {caption && <span lang={caption.lang}>{caption.text}</span>}
                          <span className="text-muted">
                            {img.sourceUrl ? (
                              <a href={img.sourceUrl} className="hover:underline">
                                {t("photoCredit", { author: img.author, license })}
                              </a>
                            ) : (
                              t("photoCredit", { author: img.author, license })
                            )}
                          </span>
                        </figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {plant.references.length > 0 && (
            <Section title={t("references")}>
              <ol className="list-decimal space-y-2 pl-5">
                {plant.references.map((slug) => {
                  const ref = lookups.references.get(slug);
                  if (!ref) return null;
                  return (
                    <li key={slug} lang="en">
                      {ref.citation}
                      {ref.url && (
                        <>
                          {" "}
                          <a
                            href={ref.url}
                            className="break-all text-accent underline underline-offset-2"
                          >
                            {ref.url}
                          </a>
                        </>
                      )}
                      {ref.doi && (
                        <>
                          {" "}
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            className="text-accent hover:underline"
                          >
                            doi:{ref.doi}
                          </a>
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Section>
          )}
        </div>

        <aside className="flex flex-col gap-8">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 font-semibold">{t("facts")}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <Fact label={t("family")}>
                {family ? (
                  <Link href={`/families/${family.slug}`} className="text-accent hover:underline">
                    {family.name}
                  </Link>
                ) : (
                  plant.family
                )}
              </Fact>
              <Fact label={t("genus")}>
                <i lang="la">{plant.genus}</i>
              </Fact>
              <Fact label={t("rank")}>{vocab(`rank.${plant.rank}`)}</Fact>
              <Fact label={t("origin")}>{vocab(`origin.${plant.originStatus}`)}</Fact>
              <Fact label={t("iucn")}>
                {plant.iucnStatus} · {vocab(`iucn.${plant.iucnStatus}`)}
              </Fact>
              {(plant.elevationMin != null || plant.elevationMax != null) && (
                <Fact label={t("elevation")}>
                  {t("elevationRange", {
                    min: plant.elevationMin ?? "?",
                    max: plant.elevationMax ?? "?",
                  })}
                </Fact>
              )}
              {plant.otherLocalNames.length > 0 && (
                <Fact label={t("otherNames")}>{plant.otherLocalNames.join(", ")}</Fact>
              )}
              {plant.synonyms.length > 0 && (
                <Fact label={t("synonyms")}>
                  {plant.synonyms.map((s, i) => (
                    <span key={s}>
                      {i > 0 && ", "}
                      <i lang="la">{s}</i>
                    </span>
                  ))}
                </Fact>
              )}
            </dl>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{t("where")}</h2>
            {plant.isSensitive && (
              <p role="note" className="flex gap-2 rounded-lg bg-warn-bg p-3 text-sm text-warn-fg">
                <ShieldIcon className="mt-0.5 size-4 shrink-0" />
                {t("sensitive")}
              </p>
            )}
            {plant.provinces.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-muted">{t("provinces")}</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {plant.provinces.map((slug) => {
                    const p = lookups.provinces.get(slug);
                    if (!p) return null;
                    const label = placeName(p, locale);
                    return (
                      <li key={slug}>
                        <Link
                          href={`/provinces/${slug}`}
                          lang={label.lang}
                          className="inline-block rounded-full border border-border px-2.5 py-0.5 text-sm hover:border-accent hover:text-accent"
                        >
                          {label.text}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {plant.habitats.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-muted">{t("habitats")}</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {plant.habitats.map((slug) => {
                    const h = lookups.habitats.get(slug);
                    if (!h) return null;
                    const label = placeName(h, locale);
                    return (
                      <li key={slug}>
                        <Badge>
                          <span lang={label.lang}>{label.text}</span>
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{t("links")}</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {externalLinks(plant).map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="inline-flex items-center gap-1.5 text-accent hover:underline"
                  >
                    {link.direct ? link.name : t("searchIn", { name: link.name })}
                    <ExternalIcon className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2 text-sm">
            <a
              href={`${REPO_URL}/issues/new?${new URLSearchParams({
                title: `Correction: ${plant.scientificName}`,
                body: `Page: ${pageUrl}\n\nWhat should change, and what is your source?\n`,
              })}`}
              className="rounded-full border border-accent px-4 py-2 text-center font-medium text-accent hover:bg-accent-soft"
            >
              {t("suggestEdit")}
            </a>
            <a
              href={`${REPO_URL}/blob/main/content/plants/${slug}/index.yaml`}
              className="text-center text-muted hover:underline"
            >
              {t("editFile")}
            </a>
          </section>

          <section className="rounded-xl bg-neutral-bg p-4 text-sm">
            <h2 className="mb-2 font-semibold">{t("cite")}</h2>
            <p lang="en" className="break-words">
              Plant in Cambodia contributors ({new Date().getFullYear()}).{" "}
              <i>{plant.scientificName}</i>
              {plant.author && ` ${plant.author}`}. {SITE_NAME.en}. {pageUrl}
            </p>
          </section>
        </aside>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Doc({
  doc,
  locale,
  note,
}: {
  doc: NonNullable<ReturnType<typeof pickDoc>>;
  locale: Locale;
  note: string;
}) {
  return (
    <>
      {doc.isFallback && locale === "km" && <p className="mb-2 text-xs text-muted">{note}</p>}
      <MarkdocContent node={doc.node} lang={doc.lang} />
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

/** Links to the main plant databases: the record itself when we have its ID, otherwise a search. */
function externalLinks(plant: Plant) {
  const q = encodeURIComponent(plant.scientificName);
  const { gbifKey, powoId, wfoId, inaturalistId } = plant.links;
  return [
    gbifKey
      ? { name: "GBIF", url: `https://www.gbif.org/species/${gbifKey}`, direct: true }
      : { name: "GBIF", url: `https://www.gbif.org/species/search?q=${q}`, direct: false },
    powoId
      ? { name: "POWO (Kew)", url: `https://powo.science.kew.org/taxon/${powoId}`, direct: true }
      : { name: "POWO (Kew)", url: `https://powo.science.kew.org/results?q=${q}`, direct: false },
    wfoId
      ? {
          name: "World Flora Online",
          url: `https://www.worldfloraonline.org/taxon/${wfoId}`,
          direct: true,
        }
      : {
          name: "World Flora Online",
          url: `https://www.worldfloraonline.org/search?query=${q}`,
          direct: false,
        },
    { name: "IUCN Red List", url: `https://www.iucnredlist.org/search?query=${q}`, direct: false },
    inaturalistId
      ? {
          name: "iNaturalist",
          url: `https://www.inaturalist.org/taxa/${inaturalistId}`,
          direct: true,
        }
      : {
          name: "iNaturalist",
          url: `https://www.inaturalist.org/taxa/search?q=${q}`,
          direct: false,
        },
  ];
}

/** schema.org Taxon structured data for search engines. */
function JsonLd({ plant, familyName, url }: { plant: Plant; familyName?: string; url: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Taxon",
    name: plant.scientificName,
    taxonRank: plant.rank,
    url,
    alternateName: [plant.khmerName, plant.englishName, ...plant.otherLocalNames].filter(Boolean),
    description: plant.summary.en || undefined,
    parentTaxon: {
      "@type": "Taxon",
      name: plant.genus,
      taxonRank: "genus",
      ...(familyName && {
        parentTaxon: { "@type": "Taxon", name: familyName, taxonRank: "family" },
      }),
    },
    sameAs: externalLinks(plant)
      .filter((l) => l.direct)
      .map((l) => l.url),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

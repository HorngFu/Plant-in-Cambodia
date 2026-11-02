import Link from "next/link";
import { LeafIcon } from "@/components/icons";

/**
 * "/" stays a static page (decision D1): a tiny script sends Khmer browsers to /km and everyone
 * else to /en, with plain links for visitors without JavaScript.
 */
const chooseLanguage = `(function(){var l=navigator.languages||[navigator.language||""];for(var i=0;i<l.length;i++){var c=String(l[i]).toLowerCase();if(c.indexOf("km")===0){location.replace("/km");return}if(c.indexOf("en")===0)break}location.replace("/en")})()`;

export default function ChooseLanguage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <script dangerouslySetInnerHTML={{ __html: chooseLanguage }} />
      <LeafIcon className="size-12 text-accent" />
      <div className="flex flex-col gap-2">
        <h1 lang="km" className="text-3xl font-bold">
          រុក្ខជាតិនៅកម្ពុជា
        </h1>
        <p className="text-xl text-muted">Plant in Cambodia</p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/km"
          lang="km"
          hrefLang="km"
          className="rounded-full bg-accent px-6 py-2.5 font-semibold text-surface hover:bg-accent-strong"
        >
          ភាសាខ្មែរ
        </Link>
        <Link
          href="/en"
          hrefLang="en"
          className="rounded-full border border-border px-6 py-2.5 font-semibold hover:border-accent hover:text-accent"
        >
          English
        </Link>
      </div>
    </main>
  );
}

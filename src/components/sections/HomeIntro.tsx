/**
 * Home-page SEO intro — short, rich semantic block kept in the rendered HTML so
 * Google has a clean snippet candidate (and stops grabbing the footer's contact
 * info for the SERP description).
 * Visually HIDDEN (`sr-only`) per request: not shown to visitors, but still present
 * for search engines and screen readers. Remove the component entirely to drop the
 * SEO text too.
 */
export default function HomeIntro() {
  return (
    <section className="sr-only" aria-label="Про магазин Eonni">
      <div>
        <h2>
          Магазин корейської косметики в Києві
        </h2>
        <p>
          Eonni — оригінальна K-beauty з доставкою по всій Україні.
          Догляд за обличчям, тілом і волоссям, корейські БАДи, маски та косметичні девайси
          від офіційних брендів — Medicube, Mediheal, Torriden, UNOVE, VT&nbsp;Cosmetics,
          LACTOFIT, VITAHALO, PROBIODERM, CJ&nbsp;WELLCARE, INNERLAB та ARDIEM.
          Кур&apos;єр по Києву за 2-4&nbsp;години, Нова Пошта по
          Україні. Повернення протягом 14&nbsp;днів.
        </p>
      </div>
    </section>
  )
}

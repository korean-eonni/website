/**
 * Home-page SEO intro — short, rich semantic block kept in the rendered HTML so
 * Google has a clean snippet candidate (and stops grabbing the footer's contact
 * info for the SERP description).
 * Visually hidden (`sr-only`) but available to assistive technologies.
 */
export default function HomeIntro() {
  return (
    <section className="sr-only" aria-label="Про магазин eonni">
      <div>
        <h2>
          Магазин корейської косметики в Києві
        </h2>
        <p>
          eonni — оригінальна K-beauty з доставкою по всій Україні.
          Догляд за обличчям, тілом і волоссям, корейські БАДи, маски та косметичні девайси
          від офіційних брендів — Medicube, Mediheal, Torriden, UNOVE, VT&nbsp;Cosmetics,
          LACTOFIT, VITAHALO, PROBIODERM, CJ&nbsp;WELLCARE, INNERLAB та ARDIEM.
          Доставка Новою Поштою та Укрпоштою по Україні.
        </p>
      </div>
    </section>
  )
}

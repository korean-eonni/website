export function AdminLogin({
  action,
  configured,
}: {
  action: (formData: FormData) => Promise<void>
  configured: boolean
}) {
  return (
    <main className="relative z-[80] -mt-[86px] grid min-h-screen place-items-center bg-[#17131F] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#D7FF67] text-sm font-black">
            EO
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-[#17131F]">Eonni Operations</h1>
            <p className="text-sm text-black/50">Захищений доступ до адмін-панелі</p>
          </div>
        </div>
        {!configured && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            На сервері не налаштовано ADMIN_PASSWORD / ADMIN_SECRET. Вхід закритий.
          </div>
        )}
        <form action={action}>
          <label className="mb-2 block text-sm font-medium" htmlFor="admin-password">
            Пароль адміністратора
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={!configured}
            className="h-12 w-full rounded-xl border border-black/20 px-4 outline-none transition focus:border-[#6046A3] focus:ring-2 focus:ring-[#6046A3]/20 disabled:bg-black/5"
          />
          <button
            type="submit"
            disabled={!configured}
            className="mt-5 h-12 w-full rounded-xl bg-[#17131F] font-semibold text-white transition hover:bg-[#6046A3] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Увійти
          </button>
        </form>
      </div>
    </main>
  )
}

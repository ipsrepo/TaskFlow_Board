const AvatarStack = () => (
    <div className="flex -space-x-2">
        {['SJ', 'MR', 'AK'].map((initials, index) => (
            <span
                key={initials}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold ${
                    index === 0
                        ? 'bg-primary-200 text-primary-900'
                        : index === 1
                            ? 'bg-sky-200 text-sky-800'
                            : 'bg-amber-200 text-amber-900'
                }`}
            >
        {initials}
      </span>
        ))}
    </div>
);

const ProgressRow = ({label, progress, tone = 'bg-primary-400'}) => (
    <div>
        <div className="mb-1.5 flex items-center justify-between text-[9px] font-medium text-slate-500">
            <span>{label}</span>
            <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${tone}`} style={{width: `${progress}%`}}/>
        </div>
    </div>
);

const DashboardPreview = () => (
    <div className="relative mx-auto mt-10 w-full max-w-[530px] animate-slide-up sm:mt-12">
        <div className="absolute -right-4 top-9 h-40 w-40 rounded-full bg-white/10 blur-2xl"/>
        <div
            className="relative rounded-2xl border border-white/40 bg-white p-3.5 shadow-[0_24px_48px_rgba(9,30,66,0.24)] sm:p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                    <p className="text-[10px] font-bold text-slate-800">Team overview</p>
                    <p className="mt-0.5 text-[8px] text-slate-400">Everything is moving forward</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success"/>
                    <span className="text-[8px] font-semibold text-success">On track</span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-[1.06fr_0.94fr] gap-3">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                            <p className="text-[8px] font-medium text-slate-400">Open tasks</p>
                            <p className="mt-1 text-lg font-bold tracking-[-0.05em] text-slate-900">24</p>
                            <p className="mt-0.5 text-[8px] font-semibold text-success">+12% this week</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                            <p className="text-[8px] font-medium text-slate-400">Completion</p>
                            <p className="mt-1 text-lg font-bold tracking-[-0.05em] text-slate-900">78%</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                <div className="h-full w-[78%] rounded-full bg-primary"/>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 p-2.5">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[9px] font-semibold text-slate-700">Project activity</p>
                            <span
                                className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[8px] font-semibold text-primary-700">This week</span>
                        </div>
                        <div className="flex h-16 items-end gap-1.5">
                            {[36, 54, 43, 70, 58, 86, 76, 100].map((height, index) => (
                                <span
                                    key={`${height}-${index}`}
                                    className={`flex-1 rounded-t-sm ${index === 6 ? 'bg-primary' : 'bg-primary-100'}`}
                                    style={{height: `${height}%`}}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-100 p-2.5">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-semibold text-slate-700">Sprint progress</p>
                        <span className="text-[8px] text-slate-400">14 days left</span>
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                        <div
                            className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-[9px] border-primary-100 border-t-primary border-r-primary">
                            <div className="text-center">
                                <p className="text-base font-bold tracking-[-0.05em] text-slate-900">72%</p>
                                <p className="text-[7px] font-medium text-slate-400">Complete</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2.5">
                        <ProgressRow label="Design" progress={88}/>
                        <ProgressRow label="Development" progress={71} tone="bg-sky-400"/>
                        <ProgressRow label="Review" progress={45} tone="bg-amber-400"/>
                    </div>
                </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-100 p-2.5">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[9px] font-semibold text-slate-700">Recent updates</p>
                    <AvatarStack/>
                </div>
                <div className="space-y-2">
                    {['Design review is ready for approval', 'Landing page tasks moved to QA', 'New research items added to the sprint'].map((item, index) => (
                        <div key={item} className="flex items-center gap-2">
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-success' : index === 1 ? 'bg-primary' : 'bg-warning'}`}/>
                            <span className="flex-1 text-[8px] font-medium text-slate-500">{item}</span>
                            <span className="text-[7px] text-slate-300">{index + 1}h</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div
            className="absolute -right-8 bottom-8 hidden w-40 rounded-xl border border-white/50 bg-white p-3 shadow-[0_14px_28px_rgba(9,30,66,0.18)] sm:block">
            <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-slate-700">Workload</span>
                <span className="text-[8px] font-semibold text-success">Balanced</span>
            </div>
            <div className="mt-2 flex h-10 items-end gap-1">
                {[46, 65, 34, 82, 58, 74].map((height, index) => (
                    <span key={`${height}-${index}`} className="flex-1 rounded-t-sm bg-primary-200 last:bg-primary"
                          style={{height: `${height}%`}}/>
                ))}
            </div>
        </div>
    </div>
);

const AuthShowcase = () => (
    <section className="relative flex min-h-dvh overflow-hidden bg-primary px-8 py-10 text-white lg:px-14 xl:px-20">

        <div
            className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.16),transparent_31%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.13),transparent_34%),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:auto,auto,96px_96px,96px_96px]"/>
        <div
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border-[34px] border-white/10"/>
        <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full border-[40px] border-white/10"/>

        <div className="relative">
      <span
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/85 backdrop-blur-sm">
        Work, organized
      </span>
            <h1 className="mt-7 max-w-md text-4xl font-bold leading-[1.12] tracking-[-0.055em] xl:text-[43px]">
                Keep every project moving with clarity.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75 xl:text-[15px]">
                Plan priorities, track progress, and give everyone a single source of truth for the work that matters.
            </p>
            <DashboardPreview/>
        </div>

        <div className="relative mt-8 flex items-center gap-3 text-xs text-white/75">
            <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-bold text-white">✓</span>
            <span>Built for focused teams and fast-moving work.</span>
        </div>
    </section>
);

export default AuthShowcase;

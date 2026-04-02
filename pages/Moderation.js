export const Moderation = {
  render: async () => `
<div class="max-w-6xl mx-auto px-6 py-12">
    <header class="mb-12 flex flex-col items-center text-center">
        <h1 class="font-headline font-bold text-5xl text-on-surface tracking-tighter mb-4 italic text-emerald-400 font-sans">GUARDIAN <span class="text-on-surface not-italic">CENTRAL</span></h1>
        <p class="font-body text-outline max-w-2xl">Ensuring the Inkbound Atelier remains a sanctuary for true creative expression. 🛡️</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        <div class="bg-surface-container p-6 rounded-[2.5rem] shadow-lg border border-outline-variant/5">
            <h4 class="text-xs font-label uppercase tracking-widest text-outline mb-4 italic">Safety Score</h4>
            <div class="flex items-center gap-4">
                <span class="text-3xl font-headline font-bold text-emerald-400">99.8%</span>
                <span class="text-[10px] font-bold text-emerald-400 font-sans px-2 py-1 bg-emerald-400/10 rounded-full">Secure</span>
            </div>
        </div>
        <div class="bg-surface-container p-6 rounded-[2.5rem] shadow-lg border border-outline-variant/5">
            <h4 class="text-xs font-label uppercase tracking-widest text-outline mb-4 italic">Active Reports</h4>
            <div class="flex items-center gap-4">
                <span class="text-3xl font-headline font-bold text-on-surface">3</span>
                <span class="text-[10px] font-bold text-secondary font-sans px-2 py-1 bg-secondary/10 rounded-full uppercase tracking-widest">Low Risk</span>
            </div>
        </div>
        <div class="bg-surface-container p-6 rounded-[2.5rem] shadow-lg border border-outline-variant/5">
            <h4 class="text-xs font-label uppercase tracking-widest text-outline mb-4 italic">Resolved Today</h4>
            <div class="flex items-center gap-4">
                <span class="text-3xl font-headline font-bold text-on-surface">142</span>
                <span class="text-[10px] font-bold text-emerald-400 font-sans px-2 py-1 bg-emerald-400/10 rounded-full">+42%</span>
            </div>
        </div>
        <div class="bg-surface-container p-6 rounded-[2.5rem] shadow-lg border border-outline-variant/5">
            <h4 class="text-xs font-label uppercase tracking-widest text-outline mb-4 italic">Filtered Threads</h4>
            <div class="flex items-center gap-4">
                <span class="text-3xl font-headline font-bold text-on-surface">12.4K</span>
                <span class="material-symbols-outlined text-secondary text-sm">security_update_good</span>
            </div>
        </div>
    </div>

    <section>
        <div class="flex items-center justify-between mb-8">
            <h2 class="font-headline font-bold text-3xl">Active Oversight Console</h2>
            <button class="text-primary font-bold hover:underline" onclick="window.history.back()">Exit Guardian</button>
        </div>
        <div class="space-y-4">
            <div class="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 flex items-center justify-between group">
                <div class="flex items-center gap-6">
                    <div class="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center shadow-lg">
                        <span class="material-symbols-outlined text-secondary">report_problem</span>
                    </div>
                    <div>
                        <h3 class="font-headline font-bold text-xl text-on-surface mb-1">No active reports</h3>
                        <p class="text-xs text-outline font-label uppercase tracking-widest">Atelier is clear</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>`,
  afterRender: async () => {}
};
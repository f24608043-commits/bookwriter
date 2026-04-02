import { BookService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

export const Analytics = {
    render: async () => {
        const user = await AuthService.getCurrentUser();
        if (!user) return `<div class="p-20 text-center">Please sign in to view your impact metrics.</div>`;

        const personalBooks = await BookService.getPersonalBooks(user.id);
        const totalViews = personalBooks.reduce((sum, book) => sum + (book.views || 0), 0);
        const avgRating = personalBooks.length > 0
            ? (personalBooks.reduce((sum, book) => sum + (book.average_rating || 0), 0) / personalBooks.length).toFixed(1)
            : '0.0';

        return `
        <div class="max-w-6xl mx-auto px-6 py-12">
            <header class="mb-16">
                <h1 class="text-5xl font-headline font-black tracking-tighter mb-2 text-on-surface">Atelier Analytics</h1>
                <p class="text-outline font-body italic text-lg">Measuring the reach of your narrative architects.</p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div class="bg-surface-container-high p-8 rounded-[3rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
                    <div class="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
                    <p class="text-xs font-label text-outline uppercase tracking-widest mb-4">Total Reads</p>
                    <p class="text-5xl font-headline font-black text-on-surface">${totalViews.toLocaleString()}</p>
                    <p class="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-4">+12.4% this month</p>
                </div>
                <div class="bg-surface-container-high p-8 rounded-[3rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
                    <div class="absolute -top-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all"></div>
                    <p class="text-xs font-label text-outline uppercase tracking-widest mb-4">Avg. Rating</p>
                    <p class="text-5xl font-headline font-black text-on-surface">${avgRating}</p>
                    <div class="flex items-center gap-1 text-secondary mt-4">
                        ${Array(5).fill().map((_, i) => `<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' ${i < Math.floor(avgRating) ? 1 : 0};">star</span>`).join('')}
                    </div>
                </div>
                 <div class="bg-surface-container-high p-8 rounded-[3rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden group">
                    <div class="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
                    <p class="text-xs font-label text-outline uppercase tracking-widest mb-4">Engagement</p>
                    <p class="text-5xl font-headline font-black text-on-surface">82%</p>
                    <p class="text-outline text-[10px] uppercase font-bold tracking-widest mt-4 last-chapter-tracking">Readers reaching last chapter</p>
                </div>
            </div>

            <section class="space-y-8">
                <h2 class="text-2xl font-headline font-bold px-4">Performance by Manuscript</h2>
                <div class="space-y-4">
                    ${personalBooks.map(book => `
                         <div class="flex items-center justify-between p-6 bg-surface-container rounded-3xl border border-outline-variant/5 hover:border-outline-variant/20 transition-all group">
                            <div class="flex items-center gap-6">
                                <div class="w-14 h-20 bg-surface-container-low rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                    <img src="${book.cover_url || '/images/image_4.webp'}" class="w-full h-full object-cover"/>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold font-headline mb-1">${book.title}</h3>
                                    <p class="text-xs text-outline uppercase tracking-widest">${book.status} • ${book.genre}</p>
                                </div>
                            </div>
                            <div class="flex gap-12 text-right">
                                <div>
                                    <p class="text-[10px] text-outline uppercase tracking-widest mb-1">Views</p>
                                    <p class="font-headline font-bold text-lg">${book.views || 0}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-outline uppercase tracking-widest mb-1">Rating</p>
                                    <p class="font-headline font-bold text-lg">${book.average_rating || '0.0'}</p>
                                </div>
                                <div class="w-8 flex items-center justify-center">
                                     <span class="material-symbols-outlined text-outline cursor-pointer hover:text-primary" onclick="window.router.navigate('/editor?id=${book.id}')">edit_note</span>
                                </div>
                            </div>
                         </div>
                    `).join('')}
                </div>
            </section>
        </div>
        `;
    }
};
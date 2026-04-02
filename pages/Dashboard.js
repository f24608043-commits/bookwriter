import { BookService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

export const Dashboard = {
    render: async () => {
        const user = await AuthService.getCurrentUser();
        if (!user) return `
            <div class="max-w-2xl mx-auto py-32 text-center px-6">
                <h2 class="text-4xl font-headline font-black mb-6 tracking-tighter">Sign In Required</h2>
                <button onclick="window.router.navigate('/auth')"
                    class="px-12 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30">
                    Sign In
                </button>
            </div>`;

        const books     = await BookService.getPersonalBooks(user.id);
        const totalViews = books.reduce((s, b) => s + (b.views || 0), 0);
        const published  = books.filter(b => !b.is_draft).length;

        return `
        <div class="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <header class="mb-16">
                <h1 class="text-6xl font-headline font-black tracking-tighter mb-2">Creator Dashboard</h1>
                <p class="text-outline italic text-lg">Your literary impact at a glance.</p>
            </header>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div class="bg-surface-container-high p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-xl">
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Total Reads</p>
                    <p class="text-4xl font-headline font-black text-on-surface">${totalViews.toLocaleString()}</p>
                </div>
                <div class="bg-surface-container-high p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-xl">
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Projects</p>
                    <p class="text-4xl font-headline font-black text-on-surface">${books.length}</p>
                </div>
                <div class="bg-surface-container-high p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-xl">
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Published</p>
                    <p class="text-4xl font-headline font-black text-emerald-400">${published}</p>
                </div>
                <div class="bg-surface-container-high p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-xl">
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Drafts</p>
                    <p class="text-4xl font-headline font-black text-primary">${books.length - published}</p>
                </div>
            </div>

            <section>
                <div class="flex items-center justify-between mb-10">
                    <h2 class="text-3xl font-headline font-black">Recent Projects</h2>
                    <button onclick="window.router.navigate('/editor')"
                        class="px-8 py-3 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all">
                        + New Project
                    </button>
                </div>
                <div class="space-y-4">
                    ${books.slice(0, 5).map(book => `
                        <div class="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div class="flex items-center gap-6">
                                <div class="w-14 h-20 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-surface-container">
                                    <img src="${book.cover_url || '/images/image_4.webp'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                         onerror="this.src='/images/image_4.webp'"/>
                                </div>
                                <div>
                                    <h3 class="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors">${book.title}</h3>
                                    <p class="text-[10px] font-black uppercase tracking-widest text-outline mt-1">
                                        ${book.is_draft ? 'Draft' : 'Published'} · ${book.genre || 'General'} · ${book.boards?.length || 0} Boards
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="hidden md:block text-sm font-bold text-outline">${(book.views || 0).toLocaleString()} views</span>
                                <button onclick="window.router.navigate('/editor?id=${book.id}')"
                                    class="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-all">
                                    <span class="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button onclick="window.router.navigate('/analytics')"
                                    class="p-3 bg-surface-container rounded-xl hover:bg-surface-container-highest transition-all">
                                    <span class="material-symbols-outlined text-sm">insights</span>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                    ${books.length === 0 ? `
                        <div class="py-32 text-center opacity-40">
                            <span class="material-symbols-outlined text-5xl">ink_pen</span>
                            <p class="mt-4 italic text-outline">No projects yet.</p>
                        </div>` : ''}
                </div>
            </section>
        </div>`;
    },
    afterRender: async () => {}
};
import { BookService } from '../backend/services.js';

export const Browse = {
    render: async () => {
        const books = await BookService.getAll();

        return `
        <div class="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <!-- Browse Header -->
            <header class="mb-16">
                <h1 class="font-headline font-black text-6xl text-on-surface tracking-tighter mb-4">
                    Explore the <span class="italic text-primary underline decoration-primary/20 decoration-8 underline-offset-8">Atelier</span>
                </h1>
                <p class="font-body text-xl text-outline max-w-2xl italic">
                    Stable manuscript discovery from established architects of narrative.
                </p>
            </header>

            <!-- Genre Quick-Filters -->
            <section class="mb-12 flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button class="shrink-0 px-8 py-3 rounded-full bg-primary text-on-primary font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30">All Echoes</button>
                <button class="shrink-0 px-8 py-3 rounded-full bg-surface-container-high text-on-surface hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] border border-outline-variant/10">Fantasy</button>
                <button class="shrink-0 px-8 py-3 rounded-full bg-surface-container-high text-on-surface hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] border border-outline-variant/10">Cyberpunk</button>
                <button class="shrink-0 px-8 py-3 rounded-full bg-surface-container-high text-on-surface hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] border border-outline-variant/10">Noir</button>
                <button class="shrink-0 px-8 py-3 rounded-full bg-surface-container-high text-on-surface hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] border border-outline-variant/10">Manga</button>
            </section>

            <!-- Book Grid -->
            <section class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16">
                ${books.length > 0 ? books.map(book => `
                    <div class="group cursor-pointer" onclick="window.router.navigate('/book/${book.id}')">
                        <div class="relative aspect-[3/4] mb-6 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-primary/20 bg-surface-container">
                            <img alt="${book.title}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="${book.cover_url || '/images/image_6.webp'}"/>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                <button class="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl mb-2 hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500" onclick="event.stopPropagation(); window.router.navigate('/read/${book.id}')">Read Board</button>
                            </div>
                            <div class="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded-full">${book.genre}</div>
                        </div>
                        <h3 class="font-headline font-bold text-xl text-on-surface mb-1 group-hover:text-primary transition-colors truncate">${book.title}</h3>
                        <p class="font-label text-[10px] font-black uppercase tracking-widest text-outline">By <span class="text-on-surface-variant">${book.author ? book.author.display_name : 'The Architect'}</span></p>
                    </div>
                `).join('') : `
                    <div class="col-span-full py-40 text-center opacity-30">
                        <p class="text-2xl font-body italic">No manuscripts found for this query.</p>
                    </div>
                `}
            </section>

            <!-- Catalog End -->
            <div class="py-32 flex flex-col items-center justify-center border-t border-outline-variant/10 mt-20">
                <span class="material-symbols-outlined text-outline text-4xl mb-4">ink_pen</span>
                <p class="font-black uppercase tracking-[0.3em] text-[10px] text-outline">Atelier Catalog Exhausted</p>
            </div>
        </div>
        `;
    },
    afterRender: async () => {}
};
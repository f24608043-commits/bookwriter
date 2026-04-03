import { BookService, AuthorService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

export const Home = {
    render: async () => {
        const user = await AuthService.getCurrentUser();
        const books = await BookService.getTrending();
        const authorsList = await AuthorService.getAll();
        const continueReading = user ? await BookService.getContinueReading(user.id) : [];

        const featured = books[0] || { 
            title: 'KA cave Digital Atelier', 
            description: 'Where digital ink strands and visual narrative boards collide.', 
            cover_url: '/images/image_4.webp' 
        };

        const displayTitle = featured.title.includes(' ') 
            ? featured.title.replace(' ', ' <br/><span class="text-primary italic font-body font-light">') + '</span>'
            : featured.title;

        return `
        <!-- Hero Section -->
        <section class="relative h-[716px] w-full flex items-end overflow-hidden animate-in fade-in duration-1000">
            <div class="absolute inset-0 z-0 scale-105">
                <img alt="${featured.title}" class="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000" src="${featured.cover_url || '/images/image_4.webp'}"/>
                <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-surface/80 via-transparent to-transparent"></div>
            </div>
            <div class="relative z-10 px-6 md:px-12 pb-24 max-w-5xl">
                <div class="inline-flex items-center gap-3 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-full mb-6 backdrop-blur-md">
                    <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span class="font-sans text-[10px] font-black uppercase tracking-[0.3em]">Masterpiece Spotlight</span>
                </div>
                <h1 class="font-headline font-black text-6xl md:text-8xl mb-6 tracking-tighter leading-[0.9] text-on-surface">${displayTitle}</h1>
                <p class="font-body text-xl text-outline mb-10 max-w-xl italic line-clamp-2">${featured.description || 'Exploring the boundaries of established digital narrative.'}</p>
                <div class="flex gap-4">
                    <button class="bg-primary text-on-primary px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40 hover:scale-105 transition-all active:scale-95" onclick="window.router.navigate('/read/${featured.id}')">
                        Enter Board
                    </button>
                    <button class="bg-white/10 backdrop-blur-xl border border-white/20 text-on-surface px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-white/20 transition-all" onclick="window.router.navigate('/library')">
                        <span class="material-symbols-outlined text-lg">bookmark</span> Library
                    </button>
                </div>
            </div>
        </section>

        <!-- Continue Reading Section -->
        ${continueReading.length > 0 ? `
        <section class="px-6 md:px-12 -mt-16 relative z-20 mb-24">
            <h2 class="font-black text-[10px] uppercase tracking-[0.4em] text-outline mb-8 opacity-60">Resume Interaction</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${continueReading.map(item => `
                    <div class="bg-surface/60 backdrop-blur-2xl p-6 rounded-[3rem] border border-outline-variant/10 flex gap-6 group hover:bg-surface-container-highest transition-all duration-500 cursor-pointer shadow-2xl" onclick="window.router.navigate('/read/${item.book.id}?board=${item.board?.id || ""}')">
                        <div class="w-24 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
                            <img alt="${item.book.title}" class="w-full h-full object-cover" src="${item.book.cover_url}"/>
                        </div>
                        <div class="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 class="font-headline text-xl font-bold leading-tight line-clamp-1 text-on-surface mb-1">${item.book.title}</h3>
                                <p class="text-[9px] font-black uppercase tracking-widest text-primary">${item.board ? item.board.title : 'Chapter Inception'}</p>
                            </div>
                            <div class="space-y-3">
                                <div class="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                                    <div class="bg-secondary h-full rounded-full" style="width: ${item.progress_percentage}%"></div>
                                </div>
                                <button class="flex items-center gap-2 text-secondary text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                                    <span class="material-symbols-outlined text-sm">play_circle</span> Synchronize
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        ` : ''}

        <!-- Trending Section -->
        <section class="mb-24 ${continueReading.length === 0 ? 'mt-20' : ''} px-6 md:px-12">
            <div class="flex justify-between items-end mb-12">
                <div>
                    <h2 class="font-headline font-black text-5xl tracking-tighter">Current Echoes</h2>
                    <p class="font-body italic text-outline text-lg">Stable manuscript discovery from the global atelier.</p>
                </div>
                <button class="px-8 py-3 bg-surface-container-high rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all" onclick="window.router.navigate('/browse')">
                    View Catalog
                </button>
            </div>
            <div class="flex gap-10 overflow-x-auto pb-12 no-scrollbar snap-x">
                ${books.length > 0 ? books.map(book => `
                    <div class="flex-none w-56 snap-start group cursor-pointer" onclick="window.router.navigate('/book/${book.id}')">
                        <div class="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl group-hover:scale-[1.03] transition-all duration-700 bg-surface-container">
                            <img alt="${book.title}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="${book.cover_url || '/images/image_6.webp'}"/>
                            <div class="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">${book.genre}</div>
                        </div>
                        <h4 class="font-headline text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors text-on-surface mb-1">${book.title}</h4>
                        <p class="text-[9px] font-black uppercase tracking-widest text-outline">Author: <span class="text-on-surface-variant font-bold">${book.author?.display_name || 'Architect'}</span></p>
                    </div>
                `).join('') : `
                    <div class="w-full text-center py-20 bg-surface-container-low rounded-[3rem] border border-dashed border-outline-variant/10 opacity-40 italic">Atelier echoes empty. Start a project in the Studio.</div>
                `}
            </div>
        </section>

        <!-- Featured Authors -->
        <section class="px-6 md:px-12 mb-32">
            <div class="flex flex-col items-center mb-16">
                <h2 class="font-headline font-black text-5xl tracking-tighter text-center mb-4">Maestros of the Ink</h2>
                <div class="h-1.5 w-20 bg-primary rounded-full"></div>
            </div>
            <div class="flex flex-wrap justify-center gap-16">
                ${authorsList.length > 0 ? authorsList.map(author => `
                    <div class="flex flex-col items-center group cursor-pointer" onclick="window.router.navigate('/user/${author.id}')">
                        <div class="relative mb-6">
                            <div class="absolute -inset-2 bg-gradient-to-tr from-primary to-secondary rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700"></div>
                            <img alt="${author.display_name}" class="relative w-32 h-32 rounded-full object-cover border-4 border-surface shadow-2xl group-hover:scale-110 transition-transform duration-500" src="${author.avatar_url || '/images/image_10.webp'}"/>
                        </div>
                        <h5 class="font-headline font-black text-xl mb-1 text-on-surface">${author.display_name}</h5>
                        <p class="font-sans text-[10px] text-outline font-black uppercase tracking-[0.3em] mb-6 opacity-60">${author.username}</p>
                        <button class="px-8 py-2 bg-surface-container-highest rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl group-hover:shadow-primary/20">Follow Artist</button>
                    </div>
                `).join('') : `
                    <div class="w-full text-center py-12 italic text-outline opacity-40">Talented architects are currently transcribing...</div>
                `}
            </div>
        </section>
        `;
    },
    afterRender: async () => {}
};
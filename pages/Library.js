import { BookService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

export const Library = {
    render: async () => {
        const user = await AuthService.getCurrentUser();
        if (!user) {
             return `<div class="max-w-4xl mx-auto py-20 text-center animate-pulse"><h2 class="text-4xl font-headline font-black mb-6">Unauthorized</h2><button class="px-12 py-5 bg-primary text-on-primary rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30" onclick="window.router.navigate('/auth')">Sign In</button></div>`;
        }

        const books = await BookService.getPersonalBooks(user.id);
        const continueReading = await BookService.getContinueReading(user.id);

        return `
        <div class="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <header class="mb-16">
                 <h1 class="text-6xl font-headline font-black tracking-tighter text-on-surface mb-2">My Digital Library</h1>
                 <p class="text-outline text-lg font-body italic">Stable manuscript preservation and reading progress.</p>
            </header>

            ${continueReading.length > 0 ? `
            <section class="mb-20">
                <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-outline mb-10 opacity-60">Continue Current Boards</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${continueReading.map(item => `
                        <div class="bg-surface-container p-6 rounded-3xl flex gap-6 group hover:bg-surface-container-high transition-all cursor-pointer" onclick="window.router.navigate('/read/${item.book.id}?board=${item.board?.id || ""}')">
                            <img src="${item.book.cover_url}" class="w-20 h-28 object-cover rounded-xl shadow-lg"/>
                            <div class="flex-1 flex flex-col justify-between py-1">
                                <h4 class="text-lg font-bold truncate">${item.book.title}</h4>
                                <div class="space-y-3">
                                    <div class="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                                        <div class="h-full bg-primary" style="width: ${item.progress_percentage}%"></div>
                                    </div>
                                    <p class="text-[9px] font-black uppercase tracking-widest text-outline">Resume Interaction</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
            ` : ''}

            <section>
                <div class="flex items-center justify-between mb-10">
                    <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-outline opacity-60">Collected Masterpieces</h3>
                    <button class="text-xs font-bold text-primary hover:underline" onclick="window.router.navigate('/editor')">Go to Atelier</button>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    ${books.length > 0 ? books.map(book => `
                        <div class="group cursor-pointer" onclick="window.router.navigate('/book/${book.id}')">
                            <div class="aspect-[3/4] rounded-3xl overflow-hidden mb-4 shadow-xl group-hover:scale-105 transition-all duration-500 relative">
                                <img src="${book.cover_url || '/images/image_6.webp'}" class="w-full h-full object-cover"/>
                                <div class="absolute top-3 left-3 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest">${book.is_draft ? 'Draft' : 'Public'}</div>
                            </div>
                            <h5 class="text-sm font-bold truncate group-hover:text-primary transition-colors">${book.title}</h5>
                            <p class="text-[10px] text-outline uppercase tracking-widest font-label">${book.genre}</p>
                        </div>
                    `).join('') : `
                        <div class="col-span-full py-40 text-center opacity-30 animate-in zoom-in duration-1000">
                            <span class="material-symbols-outlined text-6xl mb-6">menu_book</span>
                            <p class="text-2xl font-body italic">Your library vault is empty. Inception awaits.</p>
                        </div>
                    `}
                </div>
            </section>
        </div>`;
    },
    afterRender: async () => {} 
};
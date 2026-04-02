import { BookService, BoardService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

export const Reader = {
    render: async ({ id }) => {
        const urlParams = new URLSearchParams(window.location.search);
        const boardId = urlParams.get('board');
        
        const user = await AuthService.getCurrentUser();
        const book = await BookService.getById(id);

        if (!book) {
            return `<div class="p-20 text-center animate-in zoom-in duration-700">
                <h2 class="text-4xl font-headline font-black mb-6 tracking-tighter">Access Restricted</h2>
                <p class="text-outline mb-12 max-w-sm mx-auto italic">This manuscript is private or has been retracted into the Secret Atelier.</p>
                <button class="px-10 py-5 bg-primary text-on-primary rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40" onclick="window.router.navigate('/')">Return Home</button>
            </div>`;
        }

        const boards = await BoardService.getByBookId(id);
        const activeBoard = boardId 
            ? boards.find(b => b.id === boardId) 
            : (boards[0] || null);

        const isManga = book.content_type === 'manga';

        return `
        <div class="reader-container min-h-screen flex flex-col items-center py-24 px-6 bg-surface-container-lowest animate-in fade-in duration-1000">
            <!-- Header Section -->
            <header class="max-w-4xl w-full mb-20 text-center relative">
                <div class="inline-flex items-center gap-3 px-4 py-1.5 mb-8 rounded-full bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-[0.3em] text-[10px]">
                    ${activeBoard ? (activeBoard.title || `Digital Board ${activeBoard.page_number}`) : 'Initializing Inception...'}
                </div>
                <h1 class="text-6xl md:text-8xl font-headline font-black tracking-tighter text-on-surface mb-6 leading-[0.8] drop-shadow-2xl">
                    ${book.title}
                </h1>
                <div class="flex items-center justify-center gap-6 text-outline font-body italic text-xl">
                    <span class="font-bold text-on-surface">By ${book.author ? book.author.display_name : 'The Architect'}</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                    <span class="uppercase font-sans font-black text-xs tracking-widest text-primary">${isManga ? 'Visual Board' : 'Ink Stream'}</span>
                </div>
            </header>

            <!-- Reading Area -->
            <div id="reading-content" class="w-full flex flex-col items-center">
                ${!activeBoard ? `
                    <div class="py-40 text-center bg-surface-container-low/30 rounded-[4rem] w-full max-w-2xl border border-outline-variant/10 animate-in zoom-in duration-1000">
                        <span class="material-symbols-outlined text-6xl text-outline mb-6">ink_pen</span>
                        <p class="text-xl font-body italic text-outline">Digital ink boards for this inception are still being transcribed.</p>
                    </div>
                ` : (isManga ? `
                    <div class="manga-panels space-y-12 max-w-4xl w-full animate-in slide-in-from-bottom duration-1000">
                        <!-- Manga specific rendering would go here if boards had panel lists -->
                        <!-- Fallback to content rendering for now as boards store html -->
                        <article class="prose-ink max-w-none text-center">
                            ${activeBoard.content || 'Visual board is invisible.'}
                        </article>
                    </div>
                ` : `
                    <article class="max-w-3xl w-full text-2xl md:text-3xl leading-[2] text-on-surface/90 space-y-12 font-body font-light selection:bg-primary/20 animate-in slide-in-from-bottom duration-1000 prose-ink">
                        ${activeBoard.content || 'The digital ink stream is currently invisible.'}
                        <div class="pt-32 text-center opacity-30 hover:opacity-100 transition-opacity">
                             <span class="material-symbols-outlined text-4xl">ink_pen</span>
                        </div>
                    </article>
                `)}
            </div>

            <!-- Dynamic Controls -->
            <aside class="fixed right-10 bottom-12 flex flex-col gap-6 z-50 animate-in slide-in-from-right duration-1000">
                <button class="w-16 h-16 bg-surface p-4 border border-outline-variant/10 shadow-2xl rounded-full flex items-center justify-center text-outline hover:text-primary transition-all group relative" onclick="window.scrollTo({top:0, behavior:'smooth'})">
                    <span class="material-symbols-outlined text-2xl">arrow_upward</span>
                    <span class="absolute right-full mr-6 bg-black/80 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">Ascend</span>
                </button>
                <button class="w-16 h-16 bg-surface p-4 border border-outline-variant/10 shadow-2xl rounded-full flex items-center justify-center text-error hover:scale-110 active:scale-95 transition-all group relative" onclick="window.history.back()">
                    <span class="material-symbols-outlined text-2xl">close</span>
                    <span class="absolute right-full mr-6 bg-black/80 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">Exit</span>
                </button>
            </aside>
            
            <!-- Board Navigation -->
            ${boards.length > 1 ? `
            <div class="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface/80 backdrop-blur-2xl border border-outline-variant/10 px-8 py-4 rounded-full shadow-2xl z-40 animate-in slide-in-from-bottom duration-1000">
                 <button class="p-3 text-outline hover:text-primary disabled:opacity-20" ${boards.indexOf(activeBoard) === 0 ? 'disabled' : ''} onclick="window.router.navigate('/read/${id}?board=${boards[boards.indexOf(activeBoard)-1].id}')">
                    <span class="material-symbols-outlined">arrow_back_ios</span>
                 </button>
                 <span class="text-[10px] font-black uppercase tracking-widest text-outline mx-4">Board ${activeBoard ? activeBoard.page_number : 1} of ${boards.length}</span>
                 <button class="p-3 text-outline hover:text-primary disabled:opacity-20" ${boards.indexOf(activeBoard) === boards.length-1 ? 'disabled' : ''} onclick="window.router.navigate('/read/${id}?board=${boards[boards.indexOf(activeBoard)+1].id}')">
                    <span class="material-symbols-outlined">arrow_forward_ios</span>
                 </button>
            </div>
            ` : ''}
        </div>
        `;
    },
    afterRender: async () => {}
};
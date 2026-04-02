import { BookService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

export const Drafts = {
    render: async () => {
        const user = await AuthService.getCurrentUser();
        if (!user) return `
            <div class="max-w-2xl mx-auto py-32 text-center px-6">
                <h2 class="text-4xl font-headline font-black mb-6 tracking-tighter">Sign In Required</h2>
                <p class="text-outline mb-10 italic text-lg">Access your manuscripts and drafts after signing in.</p>
                <button onclick="window.router.navigate('/auth')"
                    class="px-12 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30">
                    Sign In
                </button>
            </div>`;

        const drafts = await BookService.getDrafts(user.id);

        return `
        <div class="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                <div>
                    <span class="inline-block px-4 py-1.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        Work In Progress
                    </span>
                    <h1 class="text-6xl font-headline font-black tracking-tighter text-on-surface mb-2">My Drafts</h1>
                    <p class="text-outline font-body italic text-lg">Manuscripts awaiting their final form.</p>
                </div>
                <button id="create-btn-draft"
                    class="px-10 py-5 bg-secondary text-on-secondary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-secondary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <span class="material-symbols-outlined">edit_note</span> New Draft
                </button>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${drafts.length > 0 ? drafts.map(book => `
                    <div class="glass-panel p-6 rounded-[2.5rem] border border-outline-variant/10 group cursor-pointer
                                hover:border-secondary/40 transition-all duration-500 animate-in fade-in duration-700"
                         onclick="window.router.navigate('/editor?id=${book.id}')">
                        <div class="aspect-[16/9] rounded-2xl overflow-hidden mb-6 shadow-xl relative bg-surface-container">
                            <img src="${book.cover_url || '/images/image_1.webp'}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                                 onerror="this.src='/images/image_1.webp'"/>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="px-3 py-1 bg-secondary/80 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md rounded-full">
                                    Draft · ${book.boards?.length || 0} Boards
                                </span>
                            </div>
                        </div>
                        <h3 class="text-xl font-headline font-bold mb-2 truncate text-on-surface group-hover:text-secondary transition-colors">${book.title}</h3>
                        <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-outline">
                            <span>${book.genre || 'General'}</span>
                            <span>Updated ${new Date(book.updated_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-span-full py-48 flex flex-col items-center justify-center text-center opacity-40">
                        <span class="material-symbols-outlined text-7xl mb-6 text-outline">edit_document</span>
                        <p class="text-2xl font-body italic text-outline">No drafts yet. Start writing your vision.</p>
                        <button class="mt-8 px-8 py-3 border border-outline-variant/20 rounded-full font-bold text-sm hover:bg-surface-container transition-all"
                            onclick="window.router.navigate('/editor')">
                            Open Atelier
                        </button>
                    </div>
                `}
            </div>
        </div>`;
    },

    afterRender: async () => {
        const createBtn = document.querySelector('#create-btn-draft');
        if (!createBtn) return;

        createBtn.addEventListener('click', async () => {
            const user = await AuthService.getCurrentUser();
            if (!user) { window.router.navigate('/auth'); return; }

            const title = prompt('Draft title:');
            if (!title?.trim()) return;

            createBtn.disabled = true;
            createBtn.innerText = 'Creating...';

            try {
                const book  = await BookService.create(user.id, title.trim());
                const board = await import('../backend/services.js').then(m => m.BoardService.upsert({
                    book_id: book.id, page_number: 1, title: 'Chapter One', content: ''
                }));
                window.router.navigate(`/editor?id=${book.id}&board=${board.id}`);
            } catch (err) {
                console.error('[Drafts] Create failed:', err);
                alert(`Failed: ${err.message}`);
                createBtn.disabled = false;
                createBtn.innerText = 'New Draft';
            }
        });
    }
};

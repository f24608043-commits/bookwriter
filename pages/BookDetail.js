import { BookService, CommentService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

let currentBookId = null;

export const BookDetail = {
    render: async ({ id }) => {
        currentBookId = id;
        const user = await AuthService.getCurrentUser();
        const book = await BookService.getById(id);

        if (!book) {
            return `
            <div class="max-w-2xl mx-auto px-6 py-32 text-center animate-in zoom-in duration-700">
                <h2 class="text-4xl font-headline font-black mb-6 tracking-tighter">Manuscript Not Found</h2>
                <p class="text-outline mb-12 italic">This board doesn't exist or requires authorization.</p>
                <button onclick="window.router.navigate('/browse')"
                    class="px-10 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30">
                    Browse Library
                </button>
            </div>`;
        }

        const isAuthor = user?.id === book.author_id;
        const boards   = book.boards || [];
        const comments = await CommentService.getBookComments(id);

        return `
        <div class="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-1000">
            <!-- Hero -->
            <section class="flex flex-col lg:flex-row gap-16 mb-24 items-start lg:items-end">
                <!-- Cover -->
                <div class="relative group shrink-0">
                    <div class="absolute -inset-6 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl rounded-full opacity-40 group-hover:opacity-80 transition-opacity"></div>
                    <div class="relative w-72 h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/10 -rotate-2 hover:rotate-0 transition-all duration-700 bg-surface-container">
                        <img alt="${book.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                             src="${book.cover_url || '/images/image_6.webp'}" onerror="this.src='/images/image_6.webp'"/>
                        ${book.status !== 'public' ? `
                        <div class="absolute top-5 left-5 px-3 py-1.5 bg-black/60 backdrop-blur-md flex items-center gap-2 rounded-full">
                            <span class="material-symbols-outlined text-sm text-secondary">lock</span>
                            <span class="text-[9px] font-black text-white uppercase tracking-widest">Private</span>
                        </div>` : ''}
                    </div>
                </div>

                <!-- Info -->
                <div class="flex-1 space-y-8">
                    <div>
                        <div class="flex flex-wrap gap-3 mb-4">
                            <span class="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">${book.genre || 'General'}</span>
                            <span class="px-4 py-1.5 bg-surface-container-high rounded-full text-[10px] font-black uppercase tracking-widest text-outline">${book.content_type || 'Text'}</span>
                        </div>
                        <h1 class="text-6xl md:text-7xl font-headline font-black tracking-tighter leading-[0.9] text-on-surface mb-4">${book.title}</h1>
                        <p class="text-2xl font-body italic text-outline font-light">By <span class="text-on-surface font-bold cursor-pointer hover:text-primary transition-colors" onclick="window.router.navigate('/user/${book.author_id}')">${book.author?.display_name || 'Unknown Author'}</span></p>
                    </div>

                    <div class="flex flex-wrap gap-10 py-8 border-y border-outline-variant/10">
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Views</p>
                            <p class="text-3xl font-headline font-black">${(book.views || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Boards</p>
                            <p class="text-3xl font-headline font-black">${boards.length}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Status</p>
                            <p class="text-3xl font-headline font-black ${book.status === 'draft' ? 'text-outline' : 'text-emerald-400'}">${book.status === 'draft' ? 'Draft' : 'Published'}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-4">
                        ${boards.length > 0 ? `
                        <button onclick="window.router.navigate('/read/${book.id}')"
                            class="px-12 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">play_arrow</span>
                            Read Now
                        </button>` : ''}
                        ${isAuthor ? `
                        <button onclick="window.router.navigate('/editor?id=${book.id}')"
                            class="px-10 py-5 bg-surface-container-high border border-outline-variant/20 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-surface-container-highest transition-all">
                            <span class="material-symbols-outlined text-sm">edit_note</span> Edit in Studio
                        </button>` : ''}
                    </div>
                </div>
            </section>

            <!-- Description + Boards -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div class="lg:col-span-2 space-y-16">
                    ${book.description ? `
                    <article>
                        <h2 class="text-4xl font-headline font-black tracking-tighter mb-8">Synopsis</h2>
                        <p class="text-xl leading-[1.8] text-outline font-body">${book.description}</p>
                    </article>` : ''}

                    <section>
                        <h2 class="text-4xl font-headline font-black tracking-tighter mb-8">Reader Impressions</h2>
                        
                        ${user ? `
                            <div class="mb-12 bg-surface-container-high p-6 rounded-3xl border border-outline-variant/20 shadow-xl">
                                <textarea id="comment-input" rows="3" class="w-full bg-surface-container-lowest px-5 py-4 rounded-xl text-sm font-body text-on-surface border border-outline-variant/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/40 focus:outline-none resize-none mb-4" placeholder="Share your thoughts on this manuscript..."></textarea>
                                <div class="flex justify-end">
                                    <button id="post-comment-btn" class="px-8 py-3 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 hover:scale-105 transition-all">Post Impression</button>
                                </div>
                            </div>
                        ` : `
                            <div class="mb-12 p-8 bg-surface-container-low rounded-3xl text-center border border-outline-variant/10">
                                <p class="text-[11px] font-black uppercase tracking-[0.2em] text-outline mb-4">Sign in to leave an impression</p>
                                <button onclick="window.router.navigate('/login')" class="px-8 py-3 bg-surface-container-highest border border-outline-variant/20 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-on-primary transition-all shadow-md">Login</button>
                            </div>
                        `}

                        <div class="space-y-6" id="comments-list">
                            ${comments.length > 0 ? comments.map(c => `
                                <div class="p-6 bg-surface-container-low w-full rounded-[2rem] border border-outline-variant/10 flex gap-5 hover:bg-surface-container transition-colors">
                                    <div class="flex-shrink-0 cursor-pointer" onclick="window.router.navigate('/user/${c.user_id}')">
                                        <img src="${c.user?.avatar_url || '/images/image_7.webp'}" class="w-12 h-12 rounded-full object-cover shadow-md border-2 border-surface">
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-baseline justify-between mb-2">
                                            <h4 class="font-bold text-on-surface cursor-pointer hover:text-primary transition-colors" onclick="window.router.navigate('/user/${c.user_id}')">${c.user?.display_name || 'Anonymous'}</h4>
                                            <span class="text-[9px] uppercase font-black tracking-widest text-outline">${new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p class="text-sm leading-[1.8] text-on-surface/90 font-body">${c.content}</p>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="p-12 text-center opacity-60">
                                    <span class="material-symbols-outlined text-4xl mb-4 text-outline">forum</span>
                                    <p class="text-lg font-body italic text-outline">No impressions yet. Be the first to review.</p>
                                </div>
                            `}
                        </div>
                    </section>
                </div>

                <div class="sticky top-28">
                    <div class="glass-panel rounded-[3rem] p-8 border border-outline-variant/10 shadow-2xl">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-2xl font-headline font-black">Boards</h3>
                            <span class="px-3 py-1 bg-primary/10 text-primary font-black text-[10px] rounded-full uppercase tracking-widest">${boards.length}</span>
                        </div>
                        <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            ${boards.length > 0 ? boards.map(b => `
                                <button class="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-high transition-all text-left group border border-transparent hover:border-outline-variant/10"
                                    onclick="window.router.navigate('/read/${book.id}?board=${b.id}')">
                                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">${b.page_number}</div>
                                    <p class="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">${b.title || `Board ${b.page_number}`}</p>
                                    <span class="material-symbols-outlined text-sm text-outline ml-auto opacity-0 group-hover:opacity-100 transition-all">arrow_forward</span>
                                </button>
                            `).join('') : `
                                <p class="py-12 text-center italic text-outline opacity-60">No boards published yet.</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },
    afterRender: async () => {
        const postBtn = document.getElementById('post-comment-btn');
        const input   = document.getElementById('comment-input');
        
        if (postBtn && input) {
            postBtn.onclick = async () => {
                const content = input.value.trim();
                if (!content) return;

                const user = await AuthService.getCurrentUser();
                if (!user) return;

                postBtn.disabled = true;
                postBtn.innerText = 'Posting...';
                postBtn.classList.add('opacity-50');

                try {
                    await CommentService.addComment(currentBookId, user.id, content);
                    input.value = '';
                    window.router.handleRoute(); // Refresh the page to show new comment
                } catch (err) {
                    console.error('Failed to post comment', err);
                    alert('Failed to post comment: ' + err.message);
                } finally {
                    if (postBtn) {
                        postBtn.disabled = false;
                        postBtn.innerText = 'Post Impression';
                        postBtn.classList.remove('opacity-50');
                    }
                }
            };
        }
    }
};
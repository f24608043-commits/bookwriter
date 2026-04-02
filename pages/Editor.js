import { BookService, BoardService, StorageService, StatsService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';
import { supabase } from '../backend/supabase.js';

// ─── Module-level state ───────────────────────────────────
let currentBook  = null;
let currentBoard = null;
let isUploading  = false;
let autosaveTimer = null;

// ─── Helpers ─────────────────────────────────────────────
function showStatus(el, msg, color = '#22c55e') {
    if (!el) return;
    el.innerText = msg;
    el.style.background = color;
    el.classList.remove('opacity-0');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => el.classList.add('opacity-0'), 2000);
}

function setButtonState(btn, loading, text) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerText = loading ? '...' : text;
    btn.style.opacity = loading ? '0.6' : '1';
}

// ─── DASHBOARD HTML ─────────────────────────────────────
function renderDashboard(books) {
    return `
    <div class="max-w-7xl mx-auto px-6 py-16">
        <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
            <div>
                <span class="inline-block px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Creative Hub</span>
                <h1 class="text-6xl font-headline font-black tracking-tighter text-on-surface mb-2">My Atelier</h1>
                <p class="text-outline text-lg italic">Your manuscripts, boards, and creative universe.</p>
            </div>
            <button id="main-create-btn"
                class="flex items-center gap-3 px-10 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                <span class="material-symbols-outlined">add</span> New Project
            </button>
        </header>

        <div id="project-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            ${books.length > 0 ? books.map((book, i) => `
                <div class="group glass-panel p-5 rounded-[2.5rem] border border-outline-variant/10
                     hover:border-primary/40 transition-all duration-500 cursor-pointer"
                     style="animation-delay:${i*80}ms"
                     onclick="window.router.navigate('/editor?id=${book.id}')">
                    <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-5 shadow-2xl relative bg-surface-container">
                        <img src="${book.cover_url || '/images/image_6.webp'}"
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                             onerror="this.src='/images/image_6.webp'"/>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
                                onclick="event.stopPropagation(); window.router.navigate('/editor?id=${book.id}')">
                                Open Studio
                            </button>
                        </div>
                        <div class="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                            ${book.status === 'draft' ? 'Draft' : 'Live'}
                        </div>
                    </div>
                    <h3 class="font-headline font-bold text-lg text-on-surface truncate group-hover:text-primary transition-colors mb-1">${book.title}</h3>
                    <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-outline">
                        <span>${book.genre || 'General'}</span>
                        <span>${book.boards?.length || 0} Boards</span>
                    </div>
                </div>
            `).join('') : `
                <div class="col-span-full py-48 flex flex-col items-center justify-center text-center opacity-40">
                    <span class="material-symbols-outlined text-7xl mb-6 text-outline">ink_pen</span>
                    <p class="text-2xl font-body italic text-outline">Your atelier is empty. Create your first project.</p>
                </div>`
            }
        </div>
    </div>`;
}

// ─── STUDIO HTML ─────────────────────────────────────────
function renderStudio(book, board) {
    const boards = book.boards || [];
    return `
    <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-surface-container-lowest">

        <!-- LEFT SIDEBAR -->
        <aside class="w-72 bg-surface border-r border-outline-variant/10 flex flex-col h-full z-20">
            <div class="p-6 border-b border-outline-variant/10">
                <button class="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors mb-5"
                    onclick="window.router.navigate('/editor')">
                    <span class="material-symbols-outlined text-base">arrow_back</span> Hub
                </button>
                <h2 class="text-xl font-headline font-black text-on-surface truncate">${book.title}</h2>
                <p class="text-[10px] font-black uppercase tracking-widest text-primary mt-1">
                    ${book.status === 'draft' ? '✦ Draft' : '✦ Published'}
                </p>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <p class="px-2 text-[9px] font-black uppercase tracking-[0.3em] text-outline opacity-40 mb-3">Boards</p>
                ${boards.map(b => `
                    <button class="w-full text-left px-4 py-3 rounded-2xl hover:bg-surface-container-high transition-all
                        flex items-center justify-between group
                        ${board?.id === b.id ? 'bg-surface-container-highest border border-primary/20 shadow-lg' : ''}"
                        onclick="window.router.navigate('/editor?id=${book.id}&board=${b.id}')">
                        <div>
                            <p class="text-[9px] text-outline font-black uppercase tracking-widest mb-0.5">Board ${b.page_number}</p>
                            <p class="text-sm font-bold text-on-surface truncate">${b.title || 'Untitled'}</p>
                        </div>
                        ${board?.id === b.id ? '<span class="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>' : ''}
                    </button>
                `).join('')}
                <button id="add-board-btn"
                    class="w-full mt-4 p-4 border-2 border-dashed border-outline-variant/20 rounded-2xl
                           text-outline hover:text-primary hover:border-primary/40 hover:bg-primary/5
                           transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">add</span>
                    <span class="font-bold text-xs uppercase tracking-widest">New Board</span>
                </button>
            </div>
        </aside>

        <!-- MAIN EDITOR -->
        <main class="flex-1 overflow-y-auto relative custom-scrollbar">
            <!-- Fixed Toolbar -->
            <div id="editor-toolbar"
                 class="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/10
                        px-5 py-2 flex items-center justify-between shadow-lg">
                <div class="flex items-center gap-1">
                    <button class="toolbar-btn p-2.5 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline" data-cmd="bold" title="Bold">
                        <span class="material-symbols-outlined text-lg">format_bold</span>
                    </button>
                    <button class="toolbar-btn p-2.5 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline" data-cmd="italic" title="Italic">
                        <span class="material-symbols-outlined text-lg">format_italic</span>
                    </button>
                    <div class="w-px h-5 bg-outline-variant/30 mx-1"></div>
                    <button class="toolbar-btn px-3 py-2 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline font-black text-xs" data-cmd="formatBlock" data-val="H1">H1</button>
                    <button class="toolbar-btn px-3 py-2 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline font-bold text-xs" data-cmd="formatBlock" data-val="H2">H2</button>
                    <div class="w-px h-5 bg-outline-variant/30 mx-1"></div>
                    <button class="toolbar-btn p-2.5 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline" data-cmd="justifyLeft" title="Left">
                        <span class="material-symbols-outlined text-lg">format_align_left</span>
                    </button>
                    <button class="toolbar-btn p-2.5 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline" data-cmd="justifyCenter" title="Center">
                        <span class="material-symbols-outlined text-lg">format_align_center</span>
                    </button>
                    <button class="toolbar-btn p-2.5 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline" data-cmd="justifyRight" title="Right">
                        <span class="material-symbols-outlined text-lg">format_align_right</span>
                    </button>
                    <div class="w-px h-5 bg-outline-variant/30 mx-1"></div>
                    <button id="insert-img-btn" class="p-2.5 rounded-xl hover:bg-primary/15 hover:text-primary transition-all text-outline" title="Insert Image">
                        <span class="material-symbols-outlined text-lg">image</span>
                    </button>
                </div>
                <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-outline">
                    <span id="word-count">0 Words</span>
                    <div id="save-indicator" class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full opacity-0 transition-opacity text-[9px]">Saved</div>
                </div>
            </div>

            <!-- Writing Canvas -->
            <div class="max-w-3xl mx-auto px-8 py-16" id="editor-canvas">
                ${board ? `
                    <h1 id="board-title"
                        class="text-6xl font-headline font-black tracking-tighter text-on-surface outline-none caret-primary mb-6 empty:before:content-[attr(data-placeholder)] empty:before:text-outline/30 empty:before:pointer-events-none"
                        contenteditable="true"
                        data-placeholder="Board Title...">${board.title || ''}</h1>
                    <div class="h-px w-full bg-outline-variant/10 mb-10"></div>
                    <div id="writing-area"
                        class="min-h-[70vh] outline-none text-xl leading-[2] text-on-surface/90 font-body prose-ink selection:bg-primary/20 empty:before:content-[attr(data-placeholder)] empty:before:text-outline/20 empty:before:pointer-events-none"
                        contenteditable="true"
                        data-placeholder="Begin your manuscript here...">${board.content || ''}</div>
                ` : `
                    <div class="py-40 text-center opacity-40">
                        <span class="material-symbols-outlined text-6xl text-outline">text_fields</span>
                        <p class="text-xl italic mt-4 text-outline">Select or create a board to start writing.</p>
                    </div>`}
            </div>
        </main>

        <!-- RIGHT PANEL -->
        <aside class="w-80 bg-surface border-l border-outline-variant/10 flex flex-col overflow-y-auto">

            <!-- Status Banner -->
            <div id="save-status"
                 class="opacity-0 transition-all px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white text-center">
                Saved
            </div>

            <!-- Publish -->
            <div class="p-6 border-b border-outline-variant/10 space-y-3">
                <h4 class="text-[11px] font-black uppercase tracking-[0.3em] text-outline mb-4">Publication</h4>
                <button id="publish-btn"
                    class="w-full py-4 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-xs
                           flex items-center justify-center gap-3 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all">
                    <span class="material-symbols-outlined text-sm">rocket_launch</span>
                    ${book.status === 'draft' ? 'Publish Project' : 'Republish'}
                </button>
                <button id="save-btn"
                    class="w-full py-3 border border-outline-variant/20 rounded-full font-black uppercase tracking-widest text-xs text-outline hover:bg-surface-container transition-all">
                    Save Draft
                </button>
            </div>

            <!-- Metadata -->
            <div class="p-6 border-b border-outline-variant/10 space-y-4">
                <h4 class="text-[11px] font-black uppercase tracking-[0.3em] text-outline">Manuscript Details</h4>
                <div>
                    <label class="text-[9px] font-black uppercase tracking-widest text-outline mb-1.5 block">Genre</label>
                    <input id="genre-input" type="text" value="${book.genre || 'General'}"
                        class="w-full bg-surface-container-high px-4 py-3 rounded-xl text-sm font-bold text-on-surface border-none focus:ring-2 focus:ring-primary/40"/>
                </div>
                <div>
                    <label class="text-[9px] font-black uppercase tracking-widest text-outline mb-1.5 block">Description</label>
                    <textarea id="description-input" rows="3"
                        class="w-full bg-surface-container-high px-4 py-3 rounded-xl text-sm font-body text-on-surface border-none focus:ring-2 focus:ring-primary/40 resize-none"
                        placeholder="What is this about?">${book.description || ''}</textarea>
                </div>
            </div>

            <!-- Cover -->
            <div class="p-6 border-b border-outline-variant/10">
                <h4 class="text-[11px] font-black uppercase tracking-[0.3em] text-outline mb-4">Cover Image</h4>
                <div class="relative group cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] bg-surface-container shadow-lg">
                    <img id="cover-preview" src="${book.cover_url || '/images/image_6.webp'}"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                         onerror="this.src='/images/image_6.webp'"/>
                    <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-[10px] font-black text-white uppercase tracking-widest">Change Cover</span>
                    </div>
                    <input type="file" id="cover-upload" class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/>
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="p-6 mt-auto">
                <h4 class="text-[11px] font-black uppercase tracking-[0.3em] text-error/60 mb-4">Danger Zone</h4>
                <div class="space-y-2">
                    ${board ? `<button id="delete-board-btn"
                        class="w-full py-3 text-[10px] font-black uppercase tracking-widest text-error hover:bg-error/10 rounded-xl transition-all">
                        Delete This Board
                    </button>` : ''}
                    <button id="delete-project-btn"
                        class="w-full py-3 text-[10px] font-black uppercase tracking-widest text-white bg-error hover:bg-red-600 rounded-xl transition-all">
                        Delete Project
                    </button>
                </div>
            </div>
        </aside>

        <!-- FAB Save -->
        <div class="fixed bottom-8 right-96 z-50">
            <button id="fab-save"
                class="w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl shadow-primary/40
                       flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                <span class="material-symbols-outlined text-xl">save</span>
            </button>
        </div>
    </div>`;
}

// ─── EXPORT ───────────────────────────────────────────────
export const Editor = {

    render: async () => {
        // 1. Resolve user — critical guard
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return `
            <div class="max-w-2xl mx-auto px-6 py-32 text-center">
                <h2 class="text-4xl font-headline font-black mb-6 tracking-tighter">Access Restricted</h2>
                <p class="text-outline mb-10 italic text-lg">Sign in to access your Creative Atelier.</p>
                <button class="px-12 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                    onclick="window.router.navigate('/auth')">Sign In</button>
            </div>`;
        }

        // 2. Parse URL params
        const urlParams = new URLSearchParams(window.location.search);
        const bookId    = urlParams.get('id');
        const boardId   = urlParams.get('board');

        // 3. Dashboard mode
        if (!bookId) {
            const books = await BookService.getPersonalBooks(user.id);
            currentBook  = null;
            currentBoard = null;
            return renderDashboard(books);
        }

        // 4. Studio mode
        currentBook = await BookService.getById(bookId);

        // Verify ownership
        if (!currentBook || currentBook.author_id !== user.id) {
            return `
            <div class="max-w-2xl mx-auto px-6 py-32 text-center">
                <h2 class="text-4xl font-headline font-black mb-6">Not Found</h2>
                <p class="text-outline mb-10 italic">This manuscript doesn't exist or you don't own it.</p>
                <button class="px-10 py-4 bg-surface-container rounded-full font-bold"
                    onclick="window.router.navigate('/editor')">Back to Hub</button>
            </div>`;
        }

        const boards = currentBook.boards || [];
        if (boardId) {
            currentBoard = boards.find(b => b.id === boardId) || boards[0] || null;
        } else {
            currentBoard = boards[0] || null;
        }

        return renderStudio(currentBook, currentBoard);
    },

    afterRender: async () => {
        const user = await AuthService.getCurrentUser();

        // ── DASHBOARD MODE ────────────────────────────
        const createBtn = document.querySelector('#main-create-btn');
        if (createBtn) {
            createBtn.onclick = async () => {
                if (!user) { window.router.navigate('/auth'); return; }

                const title = prompt('Name your project:');
                if (!title?.trim()) return;

                setButtonState(createBtn, true, 'Creating...');
                try {
                    const book = await BookService.create(user.id, title.trim());
                    const board = await BoardService.upsert({
                        book_id: book.id,
                        page_number: 1,
                        title: 'Chapter One',
                        content: ''
                    });
                    window.router.navigate(`/editor?id=${book.id}&board=${board.id}`);
                } catch (err) {
                    console.error('[Editor] Create failed:', err);
                    alert(`Creation failed: ${err.message}`);
                    setButtonState(createBtn, false, 'New Project');
                }
            };
            return; // Dashboard mode — no further setup needed
        }

        // ── STUDIO MODE ───────────────────────────────
        if (!currentBook || !user) return;

        const statusEl   = document.querySelector('#save-status');
        const indicator  = document.querySelector('#save-indicator');
        const wordCount  = document.querySelector('#word-count');
        const writingArea = document.querySelector('#writing-area');
        const boardTitle  = document.querySelector('#board-title');

        // Save function
        const save = async (silent = false) => {
            if (!currentBoard || isUploading) return;

            const title   = boardTitle?.innerText?.trim() || 'Untitled';
            const content = writingArea?.innerHTML || '';
            const genre   = document.querySelector('#genre-input')?.value || 'General';
            const desc    = document.querySelector('#description-input')?.value || '';

            if (!silent) showStatus(statusEl, 'Saving...', '#6366f1');

            try {
                // Update board content
                await BoardService.upsert({ id: currentBoard.id, title, content });

                // Update book metadata  
                await BookService.update(currentBook.id, user.id, { genre, description: desc });

                if (!silent) showStatus(statusEl, 'Saved ✓', '#22c55e');
                if (indicator) {
                    indicator.classList.remove('opacity-0');
                    setTimeout(() => indicator.classList.add('opacity-0'), 1500);
                }
            } catch (err) {
                console.error('[Editor] Save failed:', err);
                if (!silent) showStatus(statusEl, `Save Failed: ${err.message}`, '#ef4444');
            }
        };

        // Toolbar
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null);
                writingArea?.focus();
            });
        });

        // Image insertion
        const insertImgBtn = document.querySelector('#insert-img-btn');
        if (insertImgBtn) {
            insertImgBtn.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file'; input.accept = 'image/*';
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file || !currentBook) return;
                    isUploading = true;
                    showStatus(statusEl, 'Uploading image...', '#f59e0b');
                    try {
                        const path = `manuscript/${currentBook.id}/${Date.now()}.${file.name.split('.').pop()}`;
                        const url = await StorageService.uploadImage(file, path);
                        document.execCommand('insertHTML', false,
                            `<div class="my-8 flex justify-center"><img src="${url}" style="max-width:100%;border-radius:1rem;box-shadow:0 25px 50px rgba(0,0,0,0.3)" class="cursor-pointer"/></div><p><br></p>`);
                        showStatus(statusEl, 'Image added ✓', '#22c55e');
                    } catch (err) {
                        showStatus(statusEl, `Upload failed: ${err.message}`, '#ef4444');
                    } finally { isUploading = false; }
                };
                input.click();
            };
        }

        // Word count + autosave
        if (writingArea) {
            writingArea.addEventListener('input', () => {
                const words = writingArea.innerText.trim().split(/\s+/).filter(Boolean).length;
                if (wordCount) wordCount.innerText = `${words} Words`;
                clearTimeout(autosaveTimer);
                autosaveTimer = setTimeout(() => save(true), 1500);
            });
            // Init count
            const words = (writingArea.innerText || '').trim().split(/\s+/).filter(Boolean).length;
            if (wordCount) wordCount.innerText = `${words} Words`;
        }

        // FAB / Save btn
        document.querySelector('#fab-save')?.addEventListener('click', () => save());
        document.querySelector('#save-btn')?.addEventListener('click', () => save());

        // Publish
        const publishBtn = document.querySelector('#publish-btn');
        if (publishBtn) {
            publishBtn.onclick = async () => {
                if (!confirm('Publish this project to the public library?')) return;
                setButtonState(publishBtn, true, 'Publishing...');
                try {
                    await save(true);
                    await BookService.publish(currentBook.id, user.id);
                    showStatus(statusEl, 'Published! ✓', '#22c55e');
                    setTimeout(() => window.location.reload(), 800);
                } catch (err) {
                    showStatus(statusEl, `Publish failed: ${err.message}`, '#ef4444');
                    setButtonState(publishBtn, false, 'Publish Project');
                }
            };
        }

        // Add new board
        document.querySelector('#add-board-btn')?.addEventListener('click', async () => {
            const nextNum = (currentBook.boards?.length || 0) + 1;
            try {
                const board = await BoardService.upsert({
                    book_id: currentBook.id,
                    page_number: nextNum,
                    title: `Chapter ${nextNum}`,
                    content: ''
                });
                window.router.navigate(`/editor?id=${currentBook.id}&board=${board.id}`);
            } catch (err) {
                alert(`Failed to create board: ${err.message}`);
            }
        });

        // Cover upload
        const coverUpload = document.querySelector('#cover-upload');
        if (coverUpload) {
            coverUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                isUploading = true;
                showStatus(statusEl, 'Uploading cover...', '#f59e0b');
                try {
                    const path = `covers/${currentBook.id}/${Date.now()}.${file.name.split('.').pop()}`;
                    const url = await StorageService.uploadImage(file, path);
                    await BookService.update(currentBook.id, user.id, { cover_url: url });
                    const preview = document.querySelector('#cover-preview');
                    if (preview) preview.src = url;
                    showStatus(statusEl, 'Cover updated ✓', '#22c55e');
                } catch (err) {
                    showStatus(statusEl, `Cover upload failed: ${err.message}`, '#ef4444');
                } finally { isUploading = false; }
            });
        }

        // Delete board
        document.querySelector('#delete-board-btn')?.addEventListener('click', async () => {
            if (!currentBoard) return;
            if (!confirm(`Delete board "${currentBoard.title}"? This cannot be undone.`)) return;
            try {
                await BoardService.delete(currentBoard.id);
                window.router.navigate(`/editor?id=${currentBook.id}`);
            } catch (err) { alert(err.message); }
        });

        // Delete project
        document.querySelector('#delete-project-btn')?.addEventListener('click', async () => {
            if (!confirm(`Permanently delete "${currentBook.title}"? ALL boards will be lost.`)) return;
            if (!confirm('Are you absolutely sure?')) return;
            try {
                await BookService.delete(currentBook.id, user.id);
                window.router.navigate('/editor');
            } catch (err) { alert(err.message); }
        });

        // Real-time board updates
        supabase.channel(`board-${currentBook?.id}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'boards',
                filter: `book_id=eq.${currentBook?.id}`
            }, () => window.router.handleRoute())
            .subscribe();
    }
};
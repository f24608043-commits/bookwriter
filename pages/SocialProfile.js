import { AuthorService, BookService, FollowService } from '../backend/services.js';
import { AuthService } from '../backend/auth.js';

let currentAuthorId = null;

export const SocialProfile = {
    render: async ({ id }) => {
        currentAuthorId = id;
        const author = await AuthorService.getById(id);
        const currentUser = await AuthService.getCurrentUser();

        if (!author) {
            return `
            <div class="max-w-2xl mx-auto px-6 py-32 text-center">
                <h2 class="text-4xl font-headline font-black mb-6 tracking-tighter">Author Not Found</h2>
                <button onclick="window.router.navigate('/browse')"
                    class="px-10 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm">
                    Browse Library
                </button>
            </div>`;
        }

        // Fetch this author's public books
        const { data: authorBooks } = await import('../backend/supabase.js').then(async ({ supabase }) => {
            return supabase
                .from('books')
                .select('id, title, cover_url, genre, views, status')
                .eq('author_id', id)
                .eq('status', 'public');
        }).catch(() => ({ data: [] }));

        const publishedBooks = authorBooks || [];
        
        let isFollowing = false;
        let followerCount = await FollowService.getFollowerCount(id);

        if (currentUser) {
            isFollowing = await FollowService.checkFollow(currentUser.id, id);
        }

        const isSelf = currentUser && currentUser.id === id;

        return `
        <div class="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <header class="flex flex-col items-center gap-8 mb-20 text-center">
                <div class="relative group">
                    <div class="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl rounded-full opacity-40 group-hover:opacity-80 transition-opacity"></div>
                    <img src="${author.avatar_url || '/images/image_7.webp'}"
                         class="relative w-48 h-48 rounded-full object-cover border-4 border-surface shadow-2xl group-hover:scale-105 transition-transform duration-500"
                         onerror="this.src='/images/image_7.webp'"/>
                </div>
                <div>
                    <h1 class="font-headline font-black text-6xl text-on-surface tracking-tighter mb-2 leading-none">${author.display_name || 'The Architect'}</h1>
                    <p class="font-body italic text-2xl text-primary/80 mb-6">@${author.username || 'inkbound'}</p>
                    <div class="flex gap-6 justify-center">
                        <div class="bg-surface-container p-6 rounded-[2rem] min-w-[120px] shadow-lg border border-outline-variant/10">
                            <p class="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Followers</p>
                            <p id="follower-count" class="text-3xl font-headline font-black text-on-surface">${followerCount}</p>
                        </div>
                        <div class="bg-surface-container p-6 rounded-[2rem] min-w-[120px] shadow-lg border border-outline-variant/10">
                            <p class="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Works</p>
                            <p class="text-3xl font-headline font-black text-on-surface">${publishedBooks.length}</p>
                        </div>
                        <div class="bg-surface-container p-6 rounded-[2rem] min-w-[120px] shadow-lg border border-outline-variant/10">
                            <p class="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Reads</p>
                            <p class="text-3xl font-headline font-black text-on-surface">${publishedBooks.reduce((s, b) => s + (b.views || 0), 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                ${author.bio ? `<p class="max-w-2xl font-body text-xl text-outline italic leading-relaxed">${author.bio}</p>` : ''}

                <div class="flex gap-4">
                    ${isSelf ? `
                        <button onclick="window.router.navigate('/profile')" class="px-10 py-4 bg-surface-container text-on-surface border border-outline-variant/20 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all">
                            Edit Profile
                        </button>
                    ` : `
                        <button id="follow-btn" data-following="${isFollowing}" class="px-10 py-4 ${isFollowing ? 'bg-surface-container text-on-surface border border-outline-variant/20' : 'bg-primary text-on-primary'} rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                            ${isFollowing ? 'Following' : 'Follow'}
                        </button>
                    `}
                </div>
            </header>

            <section>
                <h2 class="text-4xl font-headline font-black tracking-tighter mb-12">Published Works</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                    ${publishedBooks.length > 0 ? publishedBooks.map(book => `
                        <div class="group cursor-pointer" onclick="window.router.navigate('/book/${book.id}')">
                            <div class="aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-4 shadow-2xl group-hover:scale-105 transition-all duration-500 bg-surface-container">
                                <img src="${book.cover_url || '/images/image_6.webp'}"
                                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                     onerror="this.src='/images/image_6.webp'"/>
                            </div>
                            <h3 class="text-lg font-headline font-bold truncate group-hover:text-primary transition-colors">${book.title}</h3>
                            <p class="text-[10px] font-black uppercase tracking-widest text-outline mt-1">${book.genre} · ${(book.views || 0).toLocaleString()} views</p>
                        </div>
                    `).join('') : `
                        <div class="col-span-full py-32 text-center opacity-40">
                            <p class="text-xl italic text-outline">No public works yet.</p>
                        </div>`}
                </div>
            </section>
        </div>`;
    },
    afterRender: async () => {
        const followBtn = document.getElementById('follow-btn');
        if (followBtn) {
            followBtn.onclick = async () => {
                const currentUser = await AuthService.getCurrentUser();
                if (!currentUser) {
                    window.router.navigate('/login');
                    return;
                }
                
                const isCurrentlyFollowing = followBtn.getAttribute('data-following') === 'true';
                followBtn.disabled = true;
                followBtn.style.opacity = '0.7';
                
                try {
                    const nowFollowing = await FollowService.toggleFollow(currentUser.id, currentAuthorId);
                    
                    followBtn.setAttribute('data-following', nowFollowing);
                    followBtn.innerText = nowFollowing ? 'Following' : 'Follow';
                    
                    if (nowFollowing) {
                        followBtn.className = 'px-10 py-4 bg-surface-container text-on-surface border border-outline-variant/20 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-all';
                    } else {
                        followBtn.className = 'px-10 py-4 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-all';
                    }
                    
                    const countEl = document.getElementById('follower-count');
                    if (countEl) {
                        let count = parseInt(countEl.innerText) || 0;
                        count += nowFollowing ? 1 : -1;
                        countEl.innerText = Math.max(0, count);
                    }
                } catch (err) {
                    console.error('Follow failed:', err);
                } finally {
                    followBtn.disabled = false;
                    followBtn.style.opacity = '1';
                }
            };
        }
    }
};
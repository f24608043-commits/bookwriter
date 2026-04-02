import { AuthService } from '../backend/auth.js';
import { BookService } from '../backend/services.js';

export const Profile = {
    render: async () => {
        const user = await AuthService.getCurrentUser();
        if (!user) return `
            <div class="max-w-2xl mx-auto py-32 text-center px-6">
                <h2 class="text-4xl font-headline font-black mb-6 tracking-tighter">Sign In Required</h2>
                <button onclick="window.router.navigate('/auth')"
                    class="px-12 py-5 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30">Sign In</button>
            </div>`;

        const profile = user.profile || {};
        const books   = await BookService.getPersonalBooks(user.id);

        return `
        <div class="max-w-4xl mx-auto px-6 py-16 animate-in fade-in duration-700">
            <!-- Profile Header -->
            <header class="flex flex-col items-center text-center gap-6 mb-20">
                <div class="relative group">
                    <div class="absolute -inset-3 bg-gradient-to-tr from-primary to-secondary rounded-full blur-xl opacity-20 group-hover:opacity-60 transition-all duration-700"></div>
                    <img src="${profile.avatar_url || '/images/image_7.webp'}"
                         class="relative w-40 h-40 rounded-full object-cover border-4 border-surface shadow-2xl group-hover:scale-105 transition-transform duration-500"
                         onerror="this.src='/images/image_7.webp'" alt="Profile"/>
                </div>
                <div>
                    <h1 class="text-5xl font-headline font-black text-on-surface tracking-tighter mb-2">${profile.display_name || user.email.split('@')[0]}</h1>
                    <p class="text-outline font-body italic text-xl">@${profile.username || user.email.split('@')[0]}</p>
                </div>

                <div class="flex gap-8">
                    <div class="text-center">
                        <p class="text-3xl font-headline font-black text-on-surface">${books.length}</p>
                        <p class="text-[10px] font-black uppercase tracking-widest text-outline">Projects</p>
                    </div>
                    <div class="text-center">
                        <p class="text-3xl font-headline font-black text-on-surface">${books.reduce((s, b) => s + (b.views || 0), 0).toLocaleString()}</p>
                        <p class="text-[10px] font-black uppercase tracking-widest text-outline">Total Reads</p>
                    </div>
                    <div class="text-center">
                        <p class="text-3xl font-headline font-black text-on-surface">${books.filter(b => !b.is_draft).length}</p>
                        <p class="text-[10px] font-black uppercase tracking-widest text-outline">Published</p>
                    </div>
                </div>

                <div class="flex gap-4 mt-2">
                    <button onclick="window.router.navigate('/editor')"
                        class="px-8 py-3 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all">
                        Open Atelier
                    </button>
                    <button id="signout-profile-btn"
                        class="px-8 py-3 bg-surface-container border border-outline-variant/20 rounded-full font-black uppercase tracking-widest text-xs hover:bg-error/10 hover:text-error hover:border-error/30 transition-all">
                        Sign Out
                    </button>
                </div>
            </header>

            <!-- My Works -->
            <section>
                <h2 class="text-3xl font-headline font-black mb-10 tracking-tighter">My Works</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                    ${books.length > 0 ? books.map(book => `
                        <div class="group cursor-pointer" onclick="window.router.navigate('/book/${book.id}')">
                            <div class="aspect-[3/4] rounded-3xl overflow-hidden mb-4 shadow-xl group-hover:scale-105 transition-all duration-500 bg-surface-container">
                                <img src="${book.cover_url || '/images/image_6.webp'}" class="w-full h-full object-cover"
                                     onerror="this.src='/images/image_6.webp'"/>
                            </div>
                            <h4 class="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">${book.title}</h4>
                            <p class="text-[10px] font-black uppercase tracking-widest text-outline mt-1">${book.is_draft ? 'Draft' : 'Live'}</p>
                        </div>
                    `).join('') : `
                        <div class="col-span-full py-32 text-center opacity-40">
                            <span class="material-symbols-outlined text-5xl">ink_pen</span>
                            <p class="mt-4 italic text-outline">No published works yet.</p>
                        </div>`}
                </div>
            </section>
        </div>`;
    },

    afterRender: async () => {
        document.querySelector('#signout-profile-btn')?.addEventListener('click', async () => {
            await AuthService.signout();
            window.appState.user = null;
            window.router.navigate('/');
        });
    }
};
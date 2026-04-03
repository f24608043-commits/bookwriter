import { AuthService } from '../backend/auth.js';

export const Navbar = () => {
    const user = window.appState?.user;

    return `
    <div class="flex items-center gap-6 px-6">
        <button class="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary"
            onclick="window.router.navigate('/')">KA cave</button>
        <div class="hidden md:flex gap-6 text-sm font-bold">
            <button class="text-outline hover:text-on-surface transition-all" onclick="window.router.navigate('/browse')">Explore</button>
            <button class="text-outline hover:text-primary transition-all" onclick="window.router.navigate('/editor')">Write</button>
        </div>
    </div>

    <div class="flex items-center gap-3 px-6">
        <div class="relative hidden sm:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input type="text" placeholder="Search stories..."
                class="bg-surface-container-lowest border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/40 w-56 placeholder:text-outline/40 text-on-surface"/>
        </div>

        ${user ? `
            <button class="p-2 text-outline hover:text-primary hover:bg-surface-container-high rounded-full transition-all"
                onclick="window.router.navigate('/library')">
                <span class="material-symbols-outlined">menu_book</span>
            </button>
            <div class="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                onclick="window.router.navigate('/profile')">
                <img src="${user.profile?.avatar_url || '/images/image_7.webp'}" class="w-full h-full object-cover"
                     onerror="this.src='/images/image_7.webp'" alt="Profile"/>
            </div>
            <button id="signout-nav-btn"
                class="text-[10px] font-black uppercase tracking-widest text-outline hover:text-error transition-colors hidden md:block">
                Out
            </button>
        ` : `
            <button onclick="window.router.navigate('/auth')"
                class="px-6 py-2.5 bg-primary text-on-primary font-black rounded-full text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30">
                Sign In
            </button>
        `}
    </div>`;
};

// Wire signout after render
document.addEventListener('click', async (e) => {
    if (e.target.closest('#signout-nav-btn')) {
        try {
            await AuthService.signout();
            window.appState.user = null;
            window.router.navigate('/auth');
        } catch (err) {
            console.error('Signout failed:', err);
        }
    }
});

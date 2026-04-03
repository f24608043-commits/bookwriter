import { AuthService } from '../backend/auth.js';

export const Sidebar = () => {
    const user = window.appState.user;
    
    if (!window._signoutHandler) {
        window._signoutHandler = async () => {
            await AuthService.signout();
            window.appState.user = null;
            window.router.navigate('/');
        };
    }

    return `
    <div class="flex items-center gap-3 px-2 mb-8">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary">
            <span class="material-symbols-outlined font-black">auto_stories</span>
        </div>
        <div>
            <h2 class="text-xl font-bold text-primary leading-none tracking-tighter">KA cave</h2>
            <p class="text-[10px] uppercase tracking-widest text-outline font-bold">Atelier Studio</p>
        </div>
    </div>

    <nav id="nav-links" class="flex-1 space-y-1 font-['Inter'] text-sm font-medium">
        <a data-path="/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-[#222a3d] transition-colors group cursor-pointer" onclick="window.router.navigate('/')">
            <span class="material-symbols-outlined group-hover:translate-x-1 duration-200">auto_stories</span>
            <span>Home</span>
        </a>
        <a data-path="/library" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-[#222a3d] transition-colors group cursor-pointer" onclick="window.router.navigate('/library')">
            <span class="material-symbols-outlined group-hover:translate-x-1 duration-200">import_contacts</span>
            <span>My Library</span>
        </a>
        <a data-path="/browse" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-[#222a3d] transition-colors group cursor-pointer" onclick="window.router.navigate('/browse')">
            <span class="material-symbols-outlined group-hover:translate-x-1 duration-200">brush</span>
            <span>Creators</span>
        </a>
        
        <div class="py-4 opacity-20"><div class="h-[1px] bg-outline-variant"></div></div>

        <a data-path="/drafts" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-[#222a3d] transition-colors group cursor-pointer" onclick="window.router.navigate('/drafts')">
            <span class="material-symbols-outlined group-hover:translate-x-1 duration-200">edit_note</span>
            <span>Drafts</span>
        </a>
        <a data-path="/analytics" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-[#222a3d] transition-colors group cursor-pointer" onclick="window.router.navigate('/analytics')">
            <span class="material-symbols-outlined group-hover:translate-x-1 duration-200">query_stats</span>
            <span>Analytics</span>
        </a>

        ${user ? `
            <div id="sidebar-user" class="mt-8 pt-8 border-t border-outline-variant/10">
                <div class="flex items-center gap-4 px-4 py-4 rounded-2xl bg-surface-container-high/40 hover:bg-surface-container-high transition-colors cursor-pointer mb-4" onclick="window.router.navigate('/profile')">
                    <img src="${user.profile?.avatar_url || '/images/image_7.webp'}" class="w-10 h-10 rounded-full object-cover border border-outline-variant/20"/>
                    <div class="flex-1 truncate">
                        <p class="font-bold text-on-surface truncate">${user.profile?.display_name || 'Pen Name'}</p>
                        <p class="text-[10px] uppercase text-outline tracking-wider truncate">Creator Profile</p>
                    </div>
                </div>
                <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors group cursor-pointer" onclick="window._signoutHandler()">
                    <span class="material-symbols-outlined group-hover:-translate-x-1 duration-200">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        ` : `
            <div class="mt-8 px-4">
                <button class="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20" onclick="window.router.navigate('/auth')">Join Atelier</button>
            </div>
        `}
    </nav>
    <div class="px-2 mt-4">
        <button class="w-full py-4 px-4 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-2xl active:scale-95 transition-transform" onclick="window.router.navigate('/editor')">
            Write New
        </button>
    </div>
    `;
};

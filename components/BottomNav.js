export const BottomNav = () => `
<a data-path="/" class="flex flex-col items-center justify-center text-[#ff007a] bg-[#ff007a]/10 rounded-2xl px-3 py-1 scale-110 duration-300 ease-out font-['Inter'] text-[10px] font-medium uppercase tracking-widest cursor-pointer" onclick="window.router.navigate('/')">
    <span class="material-symbols-outlined">home</span>
    <span>Home</span>
</a>
<a data-path="/browse" class="flex flex-col items-center justify-center text-slate-500 opacity-80 active:bg-[#222a3d] font-['Inter'] text-[10px] font-medium uppercase tracking-widest cursor-pointer" onclick="window.router.navigate('/browse')">
    <span class="material-symbols-outlined">search</span>
    <span>Browse</span>
</a>
<a data-path="/editor" class="flex flex-col items-center justify-center text-slate-500 opacity-80 active:bg-[#222a3d] font-['Inter'] text-[10px] font-medium uppercase tracking-widest cursor-pointer" onclick="window.router.navigate('/editor')">
    <span class="material-symbols-outlined">add_box</span>
    <span>Write</span>
</a>
<a data-path="/library" class="flex flex-col items-center justify-center text-slate-500 opacity-80 active:bg-[#222a3d] font-['Inter'] text-[10px] font-medium uppercase tracking-widest cursor-pointer" onclick="window.router.navigate('/library')">
    <span class="material-symbols-outlined">auto_stories</span>
    <span>Library</span>
</a>
<a data-path="/profile" class="flex flex-col items-center justify-center text-slate-500 opacity-80 active:bg-[#222a3d] font-['Inter'] text-[10px] font-medium uppercase tracking-widest cursor-pointer" onclick="window.router.navigate('/profile')">
    <span class="material-symbols-outlined">person</span>
    <span>Profile</span>
</a>
`;

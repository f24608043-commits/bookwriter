// Messages page — social feature, no live DB yet
export const Messages = {
    render: async () => {
        return `
        <div class="h-[calc(100vh-64px)] flex items-center justify-center">
            <div class="text-center opacity-40">
                <span class="material-symbols-outlined text-7xl mb-6">chat</span>
                <h2 class="text-3xl font-headline font-black mb-3 tracking-tighter">Messages</h2>
                <p class="italic text-outline">Creator messaging — coming soon.</p>
            </div>
        </div>`;
    },
    afterRender: async () => {}
};
import { AuthService } from '../backend/auth.js';

let isLogin = true;

export const Auth = {
    render: async () => {
        // If already logged in, redirect
        if (window.appState?.user) {
            window.router.navigate('/');
            return '';
        }

        return `
        <div class="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
            <!-- Background blobs -->
            <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
            <div class="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-secondary/10 blur-[100px] pointer-events-none"></div>

            <div class="relative z-10 w-full max-w-md px-6 py-8">
                <!-- Logo -->
                <div class="text-center mb-10">
                    <button onclick="window.router.navigate('/')"
                        class="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary font-headline">
                        Inkbound
                    </button>
                    <p class="text-outline italic mt-2 text-lg">${isLogin ? 'Welcome back, Architect.' : 'Join the collective.'}</p>
                </div>

                <!-- Card -->
                <div class="bg-surface-container-high/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-outline-variant/10">

                    <!-- Tabs -->
                    <div class="flex p-1 bg-surface-container-lowest rounded-2xl mb-8 gap-1">
                        <button id="tab-login"
                            class="flex-1 py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all
                            ${isLogin ? 'bg-primary text-on-primary shadow-lg' : 'text-outline hover:text-on-surface'}">
                            Sign In
                        </button>
                        <button id="tab-signup"
                            class="flex-1 py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all
                            ${!isLogin ? 'bg-primary text-on-primary shadow-lg' : 'text-outline hover:text-on-surface'}">
                            Sign Up
                        </button>
                    </div>

                    <!-- Error box -->
                    <div id="error-box" class="hidden mb-6 p-4 bg-error/10 border border-error/30 text-error text-sm rounded-2xl"></div>

                    <!-- Form -->
                    <form id="auth-form" class="space-y-5">
                        ${!isLogin ? `
                        <div>
                            <label class="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Display Name</label>
                            <input id="display-name" type="text" required
                                class="w-full bg-surface-container-lowest rounded-2xl px-5 py-4 text-on-surface font-bold border-none focus:ring-2 focus:ring-primary/40 transition-all"
                                placeholder="e.g. Oscar Wilde"/>
                        </div>
                        <div>
                            <label class="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Username</label>
                            <input id="username" type="text" required
                                class="w-full bg-surface-container-lowest rounded-2xl px-5 py-4 text-on-surface font-bold border-none focus:ring-2 focus:ring-primary/40 transition-all"
                                placeholder="e.g. oscar_wilde"/>
                        </div>` : ''}

                        <div>
                            <label class="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Email</label>
                            <input id="email" type="email" required
                                class="w-full bg-surface-container-lowest rounded-2xl px-5 py-4 text-on-surface font-bold border-none focus:ring-2 focus:ring-primary/40 transition-all"
                                placeholder="you@inkbound.art" autocomplete="email"/>
                        </div>

                        <div>
                            <label class="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Password</label>
                            <input id="password" type="password" required minlength="6"
                                class="w-full bg-surface-container-lowest rounded-2xl px-5 py-4 text-on-surface font-bold border-none focus:ring-2 focus:ring-primary/40 transition-all"
                                placeholder="••••••••" autocomplete="${isLogin ? 'current-password' : 'new-password'}"/>
                        </div>

                        <button id="submit-btn" type="submit"
                            class="w-full py-5 rounded-full bg-primary text-on-primary font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                            ${isLogin ? 'Enter Atelier' : 'Create Account'}
                        </button>
                    </form>

                    <!-- Divider -->
                    <div class="flex items-center gap-4 my-6">
                        <div class="flex-1 h-px bg-outline-variant/20"></div>
                        <span class="text-[10px] font-black uppercase tracking-widest text-outline">or</span>
                        <div class="flex-1 h-px bg-outline-variant/20"></div>
                    </div>

                    <!-- Google -->
                    <button id="google-btn"
                        class="w-full flex items-center justify-center gap-3 py-4 rounded-full border border-outline-variant/20 bg-surface-container hover:bg-surface-container-high transition-all font-bold text-sm text-on-surface">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p class="text-center mt-6 text-sm text-outline">
                    <button onclick="window.router.navigate('/')" class="hover:text-primary transition-colors">← Back to Home</button>
                </p>
            </div>
        </div>`;
    },

    afterRender: async () => {
        const form      = document.querySelector('#auth-form');
        const loginTab  = document.querySelector('#tab-login');
        const signupTab = document.querySelector('#tab-signup');
        const googleBtn = document.querySelector('#google-btn');
        const errorBox  = document.querySelector('#error-box');
        const submitBtn = document.querySelector('#submit-btn');

        const showError = (msg) => {
            if (!errorBox) return;
            errorBox.innerText = msg;
            errorBox.classList.remove('hidden');
        };
        const hideError = () => errorBox?.classList.add('hidden');

        loginTab?.addEventListener('click', () => { isLogin = true;  window.router.handleRoute(); });
        signupTab?.addEventListener('click', () => { isLogin = false; window.router.handleRoute(); });

        googleBtn?.addEventListener('click', async () => {
            hideError();
            try {
                await AuthService.signInWithGoogle();
                // OAuth redirect — no further action needed here
            } catch (err) {
                showError(err.message || 'Google sign-in failed. Ensure it is enabled in Supabase.');
            }
        });

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            if (!submitBtn) return;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Please wait...';

            const email    = document.querySelector('#email')?.value?.trim();
            const password = document.querySelector('#password')?.value;

            try {
                if (isLogin) {
                    await AuthService.signin(email, password);
                } else {
                    const displayName = document.querySelector('#display-name')?.value?.trim();
                    const username    = document.querySelector('#username')?.value?.trim();
                    await AuthService.signup(email, password, username, displayName);
                }

                // Update global state
                window.appState.user = await AuthService.getCurrentUser();

                // Navigate to home/library
                window.router.navigate('/');
            } catch (err) {
                console.error('[Auth] Submit error:', err);
                showError(err.message || 'Authentication failed. Please check your credentials.');
                submitBtn.disabled = false;
                submitBtn.innerText = isLogin ? 'Enter Atelier' : 'Create Account';
            }
        });
    }
};

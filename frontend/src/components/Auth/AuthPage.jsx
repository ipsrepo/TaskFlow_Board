import AuthBrand from './AuthBrand';
import AuthShowcase from './AuthShowcase';

const AuthPage = ({card}) => (
    <main className="min-h-dvh bg-surface">
        <div className="grid min-h-dvh lg:grid-cols-2">
            <section
                className="flex min-h-dvh flex-col bg-surface px-6 py-7 sm:px-10 sm:py-9 lg:px-14 lg:py-10 xl:px-20">
                <AuthBrand/>

                <div className="flex flex-1 items-center justify-center py-10 lg:py-12">
                    <div className="w-full max-w-[380px] animate-fade-in">
                        {card}
                    </div>
                </div>

                <footer
                    className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} TaskBoard</span>
                    <span>Organize work with confidence.</span>
                </footer>
            </section>

            <section className="min-h-dvh">
                <AuthShowcase/>
            </section>
        </div>
    </main>
);

export default AuthPage;
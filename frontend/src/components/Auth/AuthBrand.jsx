import {Link} from 'react-router-dom';

const AuthBrand = () => (
    <Link
        to="/login"
        className="inline-flex items-center gap-2.5 rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-4 focus-visible:ring-primary-100"
        aria-label="TaskBoard sign in"
    >
    <span
        className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary text-white shadow-button">
      <span className="absolute h-4 w-4 rounded-[5px] border-2 border-white/95"/>
      <span className="absolute h-1.5 w-1.5 translate-x-[4px] -translate-y-[4px] rounded-full bg-white"/>
    </span>
        <span className="text-[17px] font-bold tracking-[-0.035em] text-secondary">TaskBoard</span>
    </Link>
);

export default AuthBrand;

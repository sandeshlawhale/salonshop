import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthFooter() {
    return (
        <p className="text-center text-xs tracking-wide text-neutral-400 font-medium pt-2">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-neutral-800 underline hover:text-neutral-900 transition-colors">
                Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-neutral-800 underline hover:text-neutral-900 transition-colors">
                Privacy Policy
            </Link>
            .
        </p>
    );
}

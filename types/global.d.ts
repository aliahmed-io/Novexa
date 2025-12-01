declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            src?: string;
            poster?: string;
            alt?: string;
            'camera-controls'?: boolean;
            'auto-rotate'?: boolean;
            ar?: boolean;
            'ar-modes'?: string;
            'ios-src'?: string;
            loading?: 'auto' | 'lazy' | 'eager';
            reveal?: 'auto' | 'interaction' | 'manual';
            [key: string]: any;
        };
    }
}

const fs = require('fs');
try {
    const localContent = fs.readFileSync('.env.local', 'utf8');
    const match = localContent.match(/STRIPE_SECRET_KEY=.*/);

    if (match) {
        const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
        if (!envContent.includes('STRIPE_SECRET_KEY')) {
            fs.appendFileSync('.env', '\n' + match[0]);
            console.log('Successfully appended STRIPE_SECRET_KEY to .env');
        } else {
            console.log('STRIPE_SECRET_KEY already exists in .env');
        }
    } else {
        console.log('STRIPE_SECRET_KEY not found in .env.local');
    }
} catch (e) {
    console.error('Error:', e.message);
}

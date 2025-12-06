
# Operations Manual

## System Health
Access the **Integration Health Dashboard** at `/store/dashboard/integrations` to view the status of:
- Database (Neon)
- Redis (Upstash)
- Stripe
- Resend
- Shippo
- Gemini AI

## Audit Logs
Critical actions are logged. View them at `/store/dashboard/audit`.
Logged actions include: `CREATE`, `UPDATE`, `DELETE`, `PUBLISH`, `ARCHIVE`, `REFUND`.

## Debugging

### Database
If you encounter `EPERM` errors with Prisma:
1. Stop the dev server (`Ctrl+C`).
2. Run `npx prisma generate`.
3. Restart server.

### AI Features
- **Assistant**: Check Gemini API key validity if responses fail.
- **3D Generation**: Check Meshy API credits. Status updates are polled every 5s on the product edit page.

## Testing
Run E2E tests before major deployments:
\`\`\`bash
npx playwright test
\`\`\`

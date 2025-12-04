import { EmailComposer } from "@/components/Dashboard/EmailComposer";

export default function EmailPage() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Email Broadcasting</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your email campaigns and announcements.
                </p>
            </div>

            <EmailComposer />
        </div>
    );
}

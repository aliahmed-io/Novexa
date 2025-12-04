import { EmailForm } from "@/components/Dashboard/EmailForm";

export default function EmailPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Email Broadcasting</h1>
            </div>
            <EmailForm />
        </div>
    );
}

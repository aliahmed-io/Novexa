import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { deleteCategory } from "../../actions";
import { SubmitButton } from "@/components/SubmitButtons";
import Link from "next/link";

export default async function DeleteCategoryRoute({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <div className="h-[80vh] w-full flex items-center justify-center">
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Are you absolutely sure?</CardTitle>
                    <CardDescription>
                        This action cannot be undone. This will permanently delete this
                        category and remove all data from our servers.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="w-full flex justify-between">
                    <Button variant="secondary" asChild>
                        <Link href="/store/dashboard/categories">Cancel</Link>
                    </Button>
                    <form action={deleteCategory}>
                        <input type="hidden" name="categoryId" value={id} />
                        <SubmitButton text="Delete Category" variant="destructive" />
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}

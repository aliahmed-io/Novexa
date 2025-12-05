"use client";

import { useEffect } from "react";
import { markAllAsRead } from "@/app/store/dashboard/contact/actions";

export function MarkAsRead() {
    useEffect(() => {
        markAllAsRead();
    }, []);

    return null;
}

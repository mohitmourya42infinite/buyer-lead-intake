"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <h2 className="text-2xl font-semibold mb-4">No buyers found</h2>
      <p className="text-gray-500 mb-6">
        You don’t have any leads yet. Start by creating your first buyer lead.
      </p>
      <Link href="/buyers/new" className="bg-black text-white rounded px-3 py-2">
        Create first lead
      </Link>
    </div>
  );
}

import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "home", label: "Home" },
  { key: "events", label: "Events" },
  { key: "profile", label: "Profile" },
  { key: "settings", label: "Settings" },
];

export default function OrgTabs({ orgId }: { orgId: string }) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-2">
          {tabs.map((t) => (
            <TabLink key={t.key} orgId={orgId} tab={t.key} label={t.label} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TabLink({ orgId, tab, label }: { orgId: string; tab: string; label: string }) {
  const [isActive] = useRoute(`/org/:orgId/${tab}`);
  return (
    <Link href={`/org/${orgId}/${tab}`}>
      <a
        className={cn(
          "px-3 py-1.5 rounded-md text-sm whitespace-nowrap",
          isActive ? "bg-gray-100 dark:bg-gray-800 font-medium" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        {label}
      </a>
    </Link>
  );
}

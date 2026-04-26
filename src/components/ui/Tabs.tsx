interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-surface dark:bg-dark-surface rounded-lg" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-body font-medium transition-colors min-h-[44px] ${
            activeTab === tab.id
              ? 'bg-accent text-white'
              : 'text-text-primary dark:text-white hover:bg-border/50 dark:hover:bg-dark-border/50'
          }`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
import { Modal } from './ui/Modal';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open Quick Sale', category: 'Actions' },
  { keys: ['⌘', 'P'], description: 'Open Command Palette', category: 'Navigation' },
  { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'Help' },
  { keys: ['Esc'], description: 'Close Modal/Dialog', category: 'General' },
  { keys: ['Tab'], description: 'Navigate Forward', category: 'General' },
  { keys: ['Shift', 'Tab'], description: 'Navigate Backward', category: 'General' },
  { keys: ['Enter'], description: 'Submit Form/Activate', category: 'General' },
  { keys: ['Space'], description: 'Activate Button', category: 'General' },
  { keys: ['←', '→'], description: 'Navigate Chart Data', category: 'Reports' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400">
          <Keyboard className="w-5 h-5" />
          <p className="text-body">
            Use these keyboard shortcuts to navigate faster
          </p>
        </div>

        {categories.map(category => (
          <div key={category}>
            <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-white mb-3">
              {category}
            </h3>
            <div className="space-y-2">
              {shortcuts
                .filter(s => s.category === category)
                .map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-md bg-surface dark:bg-dark-surface"
                  >
                    <span className="text-body text-text-primary dark:text-white">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="px-2 py-1 text-caption font-mono font-semibold text-text-primary dark:text-white bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-sm shadow-subtle">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-text-secondary dark:text-gray-400 mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border dark:border-dark-border">
          <p className="text-caption text-text-secondary dark:text-gray-400 text-center">
            Press <kbd className="px-2 py-1 text-caption font-mono font-semibold text-text-primary dark:text-white bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-sm">?</kbd> anytime to view this help
          </p>
        </div>
      </div>
    </Modal>
  );
}
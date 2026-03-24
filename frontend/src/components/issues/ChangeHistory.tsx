'use client';

interface HistoryEntry {
  id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user: {
    name: string;
  };
}

interface ChangeHistoryProps {
  history: HistoryEntry[];
}

// Helper to group history entries by user and timestamp (ignoring seconds/milliseconds for grouping)
function groupHistory(history: HistoryEntry[]) {
  const groups: { [key: string]: HistoryEntry[] } = {};

  history.forEach(entry => {
    // Group by user ID and the date/time string down to the minute
    const date = new Date(entry.created_at);
    // Create a key like "John Doe_2023-10-27T10:15"
    const groupKey = `${entry.user.name}_${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(entry);
  });

  // Convert the object back to an array of groups and sort them by the newest entry first
  return Object.values(groups).sort((a, b) => {
    return new Date(b[0].created_at).getTime() - new Date(a[0].created_at).getTime();
  });
}

export default function ChangeHistory({ history }: ChangeHistoryProps) {
  if (!history || history.length === 0) {
    return null;
  }

  const groupedHistory = groupHistory(history);

  const formatValue = (field: string, value: string | null) => {
    if (value === null || value === '') return 'None';
    // If the field is a description or something long, we might want to truncate it
    if (field === 'description' && value.length > 50) {
      return 'Updated'; // For long text fields, just saying it was updated is cleaner than showing the whole string
    }
    return value;
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Activity History</h3>
      
      <div className="space-y-6">
        {groupedHistory.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm relative">
            <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
              <span className="font-bold text-sm text-gray-900">{group[0].user.name}</span>
              <span className="text-xs text-gray-500">
                {new Date(group[0].created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            
            <ul className="space-y-2">
              {group.map((entry) => (
                <li key={entry.id} className="text-sm text-gray-700 flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mt-1.5 mr-2 flex-shrink-0"></span>
                  <div>
                    Changed <span className="font-semibold text-gray-900">{entry.field.replace('_', ' ')}</span> from{' '}
                    <span className="line-through text-gray-400 px-1">{formatValue(entry.field, entry.old_value)}</span> to{' '}
                    <span className="font-medium text-green-700 bg-green-50 px-1 rounded">{formatValue(entry.field, entry.new_value)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { ProjectMember } from '@/lib/api/projects';

export interface ActivityComment {
  id: number;
  content: string;
  created_at: string;
  user: { id: number; name: string };
  type: 'comment';
}

export interface ActivityHistoryEntry {
  id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user: { id: number; name: string };
  type: 'history';
}

export interface ActivityEntity {
  id: string;
  user: { id: number; name: string };
  created_at: string;
  comments: ActivityComment[];
  history: ActivityHistoryEntry[];
}

export interface UseActivityEntitiesOptions {
  members?: ProjectMember[];
  formatField?: (field: string) => string;
  formatValue?: (field: string, value: string | null) => string | null;
  resolveAssignee?: (oldValue: string | null, newValue: string | null) => {
    displayOld: string | null;
    displayNew: string | null;
    displayField: string;
  } | null;
}

export interface FormattedActivityEntity extends ActivityEntity {
  formattedHistory: Array<{
    id: number;
    displayField: string;
    displayOld: string | null;
    displayNew: string | null;
  }>;
}

interface UseActivityEntitiesResult {
  activityEntities: FormattedActivityEntity[];
}

export function useActivityEntities(
  comments: ActivityComment[],
  history: ActivityHistoryEntry[],
  options: UseActivityEntitiesOptions = {},
): UseActivityEntitiesResult {
  const { members = [], formatField, formatValue, resolveAssignee } = options;

  const activityEntities = useMemo(() => {
    const combined: (ActivityComment | ActivityHistoryEntry)[] = [
      ...(comments || []).map(c => ({ ...c, type: 'comment' as const })),
      ...(history || []).map(h => ({ ...h, type: 'history' as const })),
    ];
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const entities: ActivityEntity[] = [];
    combined.forEach(item => {
      const prevEntity = entities[entities.length - 1];
      const itemTime = new Date(item.created_at).getTime();
      const prevTime = prevEntity ? new Date(prevEntity.created_at).getTime() : 0;
      if (prevEntity && prevEntity.user.id === item.user.id && Math.abs(prevTime - itemTime) < 2000) {
        if (item.type === 'comment') prevEntity.comments.push(item);
        else prevEntity.history.push(item);
      } else {
        entities.push({
          id: `${item.type}-${item.id}`,
          user: item.user,
          created_at: item.created_at,
          comments: item.type === 'comment' ? [item] : [],
          history: item.type === 'history' ? [item] : [],
        });
      }
    });

    return entities.map(entity => {
      const formattedHistory = entity.history.map(h => {
        let displayField = formatField ? formatField(h.field) : h.field.replace(/_/g, ' ');
        let displayOld = formatValue ? formatValue(h.field, h.old_value) : (h.old_value || null);
        let displayNew = formatValue ? formatValue(h.field, h.new_value) : (h.new_value || null);

        if (resolveAssignee && h.field === 'assignee_id') {
          const resolved = resolveAssignee(h.old_value, h.new_value);
          if (resolved) {
            displayField = resolved.displayField;
            displayOld = resolved.displayOld;
            displayNew = resolved.displayNew;
          }
        }

        return {
          id: h.id,
          displayField,
          displayOld,
          displayNew,
        };
      });

      return {
        ...entity,
        formattedHistory,
      };
    });
  }, [comments, history, formatField, formatValue, resolveAssignee]);

  return { activityEntities };
}
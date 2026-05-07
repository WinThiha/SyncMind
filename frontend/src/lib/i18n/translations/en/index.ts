import type { Dictionary } from '../../catalog';
import { nav } from './nav';
import { auth } from './auth';
import { settings } from './settings';
import { dashboard } from './dashboard';
import { projects } from './projects';
import { issues } from './issues';
import { invitations } from './invitations';
import { milestones } from './milestones';
import { help } from './help';
import { landing } from './landing';
import { common } from './common';

export const en: Dictionary = {
  ...nav,
  ...auth,
  ...settings,
  ...dashboard,
  ...projects,
  ...issues,
  ...invitations,
  ...milestones,
  ...help,
  ...landing,
  ...common,
};

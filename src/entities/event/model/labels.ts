import type { EventStatus, EventVisibility } from './types'

export const eventStatusLabels: Record<EventStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  cancelled: 'Cancelled',
}

export const eventVisibilityLabels: Record<EventVisibility, string> = {
  public: 'Public',
  unlisted: 'Unlisted',
  private: 'Private',
}

export const eventVisibilityDescriptions: Record<EventVisibility, string> = {
  public: 'Listed in Browse Events once published.',
  unlisted: 'Not listed; only people with the link can find it.',
  private: 'Only you can see it.',
}

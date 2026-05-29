import { VonalpCompletionStatus, VonalpSourceType, VonalpVocabularyType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type WithId = { id: string };

export async function attachVonalpStatuses<T extends WithId>(
  prisma: PrismaService,
  sourceType: VonalpSourceType,
  items: T[],
) {
  if (items.length === 0) return items;

  const ids = items.map((item) => item.id);
  const vonalpTermDelegate = prisma.vonalpTerm;
  if (!vonalpTermDelegate?.findMany) return items;

  const terms = await vonalpTermDelegate.findMany({
    where: {
      sourceType,
      sourceId: { in: ids },
      completionStatus: { not: VonalpCompletionStatus.ARCHIVED },
    },
    select: {
      sourceId: true,
      vocabularyType: true,
      completionStatus: true,
    },
  });

  const statusBySource = new Map<string, {
    vonalpCompletionStatus?: VonalpCompletionStatus;
    vonalpEpCompletionStatus?: VonalpCompletionStatus;
  }>();

  for (const term of terms) {
    const status = statusBySource.get(term.sourceId) || {};
    if (term.vocabularyType === VonalpVocabularyType.VONALP) {
      status.vonalpCompletionStatus = term.completionStatus;
    } else {
      status.vonalpEpCompletionStatus = term.completionStatus;
    }
    statusBySource.set(term.sourceId, status);
  }

  return items.map((item) => ({
    ...item,
    ...statusBySource.get(item.id),
  }));
}

export async function attachVonalpStatus<T extends WithId>(
  prisma: PrismaService,
  sourceType: VonalpSourceType,
  item: T | null,
) {
  if (!item) return item;
  const [withStatus] = await attachVonalpStatuses(prisma, sourceType, [item]);
  return withStatus;
}

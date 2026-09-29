import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApprovalStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '../logger/app-logger.service';
import { maskSensitive } from '../logger/log-sanitizer';
import type { Prisma } from '@prisma/client';

type ContentEntityConfig = {
  delegateName: string;
  label: string;
  pluralLabel: string;
  itemKey: string;
  createTitle: string;
  statusTitle: string;
  articlePhrase: string;
};

type ActorSnapshot = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  supervisorId?: string | null;
};

type ContentSnapshot = {
  id: string;
  createdById?: string | null;
  approvalStatus?: ApprovalStatus | null;
  createdBy?: ActorSnapshot | null;
  [key: string]: unknown;
};

type NotificationDraft = {
  userId: string;
  title: string;
  message: string;
  type: string;
  entity?: string | null;
  entityId?: string | null;
};

type AuditNotificationData = {
  actorId?: string;
  actorRole?: UserRole;
  action: string;
  entity: string;
  entityId?: string | null;
  path: string;
<<<<<<< Updated upstream
  oldValues: Prisma.InputJsonObject | null;
  newValues: Prisma.InputJsonObject | null;
  result: unknown;
=======
  oldValues: any;
  newValues: any;
  result: any;
>>>>>>> Stashed changes
};

const CONTENT_ENTITIES: Record<string, ContentEntityConfig> = {
  Entry: {
    delegateName: 'entry',
    label: 'entrada',
    pluralLabel: 'entradas',
    itemKey: 'entry',
    createTitle: 'Nova entrada criada',
    statusTitle: 'Estado da entrada actualizado',
    articlePhrase: 'da entrada',
  },
  Neologism: {
    delegateName: 'neologism',
    label: 'neologismo',
    pluralLabel: 'neologismos',
    itemKey: 'entry',
    createTitle: 'Novo neologismo criado',
    statusTitle: 'Estado do neologismo actualizado',
    articlePhrase: 'do neologismo',
  },
  Toponym: {
    delegateName: 'toponym',
    label: 'topónimo',
    pluralLabel: 'topónimos',
    itemKey: 'toponym',
    createTitle: 'Novo topónimo criado',
    statusTitle: 'Estado do topónimo actualizado',
    articlePhrase: 'do topónimo',
  },
  Anthroponym: {
    delegateName: 'anthroponym',
    label: 'antropónimo',
    pluralLabel: 'antropónimos',
    itemKey: 'name',
    createTitle: 'Novo antropónimo criado',
    statusTitle: 'Estado do antropónimo actualizado',
    articlePhrase: 'do antropónimo',
  },
  Foreignism: {
    delegateName: 'foreignism',
    label: 'estrangeirismo',
    pluralLabel: 'estrangeirismos',
    itemKey: 'term',
    createTitle: 'Novo estrangeirismo criado',
    statusTitle: 'Estado do estrangeirismo actualizado',
    articlePhrase: 'do estrangeirismo',
  },
};

type AuditRequest = {
  method: string;
  url: string;
  user?: { id: string; role: UserRole };
  body: unknown;
  ip?: string;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  route?: { path?: string };
  requestId?: string;
  get: (name: string) => string | undefined;
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private logger: AppLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
<<<<<<< Updated upstream
    const request = context.switchToHttp().getRequest<AuditRequest>();
    const response = context.switchToHttp().getResponse<{ statusCode?: number }>();
    const { method, url, user, body, ip, params, query, route, requestId } = request;
=======
    const request = context.switchToHttp().getRequest<any>();
    const response = context.switchToHttp().getResponse<any>();
    const { method, url, user, body, ip, params, query, route, requestId } =
      request;
>>>>>>> Stashed changes
    const userAgent = request.get('user-agent');
    const path = url.split('?')[0];
    const shouldAudit = method !== 'GET';
    const actionName = this.getActionName(method, url);
    const { entityName, delegateName } = this.getEntityInfo(path);
    const entityId = params?.id || path.split('/').filter(Boolean)[1] || null;
    const sanitizedBody = this.sanitize(body);
    const oldValuesPromise = shouldAudit
      ? this.getOldValues(delegateName, entityId, method)
      : Promise.resolve(null);

    return next.handle().pipe(
      tap((data) => {
        if (!shouldAudit) return;

        void this.handleSuccessfulAudit({
          data,
          oldValuesPromise,
          method,
          body,
          entityId,
          actionName,
          entityName,
          user,
          ip,
          userAgent,
          url,
          path,
          route,
          params,
          query,
          requestId,
          sanitizedBody,
          response,
        });
      }),
      catchError((error) => {
        if (!shouldAudit) return throwError(() => error);

        void oldValuesPromise
          .then((oldValues) =>
            this.createAuditLog({
              actorId: user?.id,
              actorRole: user?.role,
              action: actionName,
              entity: entityName,
              entityId,
              oldValues,
              newValues: method === 'DELETE' ? null : sanitizedBody,
              ipAddress: ip,
              userAgent,
              status: 'FAILED',
              failureReason:
                error?.response?.message ||
                error?.message ||
                'Erro desconhecido',
              metadata: {
                method,
                url,
                path,
                route: route?.path,
                params,
                query,
                requestId,
                requestBody: sanitizedBody,
                statusCode: error?.status || error?.response?.statusCode,
                changedFields: this.getChangedFields(oldValues, sanitizedBody),
              },
            }),
          )
          .catch((auditError) => {
            this.logger.error('Failed to create failure audit log', {
              context: 'AuditInterceptor',
              action: 'AUDIT_FAILURE_LOG_FAILED',
              requestId,
              userId: user?.id,
              method,
              path,
              error: auditError,
              meta: {
                entity: entityName,
                entityId,
              },
            });
          });

        return throwError(() => error);
      }),
    );
  }

  private async handleSuccessfulAudit(params: {
    data: unknown;
    oldValuesPromise: Promise<Record<string, unknown> | null>;
    method: string;
    body: unknown;
    entityId: string | null;
    actionName: string;
    entityName: string;
    user?: { id?: string; role?: UserRole };
    ip?: string;
    userAgent?: string;
    url: string;
    path: string;
    route?: { path?: string };
    params: Record<string, string>;
    query: Record<string, string | string[]>;
    requestId?: string;
    sanitizedBody: Record<string, unknown> | null;
    response?: { statusCode?: number };
  }) {
    const oldValues = await params.oldValuesPromise;
    const dataRecord =
      params.data && typeof params.data === 'object'
        ? (params.data as Record<string, unknown>)
        : null;
    const newValues =
      params.method === 'DELETE'
        ? null
        : this.sanitize(dataRecord?.id ? params.data : params.body);
    const persistedEntityId =
      typeof dataRecord?.id === 'string' ? dataRecord.id : params.entityId;

    await this.createAuditLog({
      actorId: params.user?.id,
      actorRole: params.user?.role,
      action: params.actionName,
      entity: params.entityName,
      entityId: persistedEntityId,
      oldValues,
      newValues,
      ipAddress: params.ip,
      userAgent: params.userAgent,
      status: 'SUCCESS',
      metadata: {
        method: params.method,
        url: params.url,
        path: params.path,
        route: params.route?.path,
        params: params.params,
        query: params.query,
        requestId: params.requestId,
        requestBody: params.sanitizedBody,
        statusCode: params.response?.statusCode,
        changedFields: this.getChangedFields(oldValues, params.sanitizedBody),
      },
    });

    await this.createNotificationsFromAudit({
      actorId: params.user?.id,
      actorRole: params.user?.role,
      action: params.actionName,
      entity: params.entityName,
      entityId: persistedEntityId,
      path: params.path,
      oldValues,
      newValues,
      result: this.sanitize(params.data),
    });
  }

  private getActionName(method: string, url: string) {
    if (url.includes('/auth/login') || url.includes('/auth/refresh'))
      return 'LOGIN';
    if (method === 'POST') return 'CREATE';
    if (method === 'PATCH' || method === 'PUT') return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';
    return 'OTHER';
  }

  private getEntityInfo(path: string) {
    const resource = path.split('/').filter(Boolean)[0] || 'unknown';
    const entityMap: Record<
      string,
      { entityName: string; delegateName?: string }
    > = {
      entries: { entityName: 'Entry', delegateName: 'entry' },
      neologisms: { entityName: 'Neologism', delegateName: 'neologism' },
      toponyms: { entityName: 'Toponym', delegateName: 'toponym' },
      anthroponyms: { entityName: 'Anthroponym', delegateName: 'anthroponym' },
      foreignisms: { entityName: 'Foreignism', delegateName: 'foreignism' },
      'blog-posts': { entityName: 'BlogPost', delegateName: 'blogPost' },
      events: { entityName: 'Event', delegateName: 'event' },
      'event-registrations': {
        entityName: 'EventRegistration',
        delegateName: 'eventRegistration',
      },
      users: { entityName: 'User', delegateName: 'user' },
      media: { entityName: 'MediaAsset', delegateName: 'mediaAsset' },
      auth: { entityName: 'Auth' },
    };

    return (
      entityMap[resource] || {
        entityName:
          resource.charAt(0).toUpperCase() +
          resource.slice(1).replace(/s$/, ''),
      }
    );
  }

  private async getOldValues(
    delegateName: string | undefined,
    entityId: string | null,
    method: string,
  ) {
    if (
      !delegateName ||
      !entityId ||
      !['PUT', 'PATCH', 'DELETE'].includes(method)
    )
      return null;

    const delegate = this.getDelegate(delegateName);
    if (!delegate) return null;

    try {
      return this.sanitize(
        await delegate.findUnique({ where: { id: entityId } }),
      );
    } catch (error) {
      this.logger.warn('Failed to load old values for audit', {
        context: 'AuditInterceptor',
        action: 'AUDIT_OLD_VALUES_FAILED',
        error,
        meta: { delegateName, entityId, method },
      });
      return null;
    }
  }

  private sanitize(value: unknown): Prisma.InputJsonObject | null {
    const masked = maskSensitive(value);
<<<<<<< Updated upstream
    return masked && typeof masked === 'object' && !Array.isArray(masked) ? masked as Prisma.InputJsonObject : null;
  }

  private getChangedFields(oldValues: Prisma.InputJsonObject | null, newValues: Prisma.InputJsonObject | null) {
=======
    return masked && typeof masked === 'object' && !Array.isArray(masked)
      ? (masked as Record<string, unknown>)
      : null;
  }

  private getChangedFields(
    oldValues: Record<string, unknown> | null,
    newValues: Record<string, unknown> | null,
  ) {
>>>>>>> Stashed changes
    if (!oldValues || !newValues || typeof newValues !== 'object') return [];
    return Object.keys(newValues).filter(
      (key) =>
        JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]),
    );
  }

  private async createAuditLog(data: any) {
    try {
      await this.prisma.auditLog.create({ data });
    } catch (error) {
      this.logger.error('Failed to persist audit log', {
        context: 'AuditInterceptor',
        action: 'AUDIT_LOG_WRITE_FAILED',
        userId: data?.actorId,
        method: data?.metadata?.method,
        path: data?.metadata?.path,
        requestId: data?.metadata?.requestId,
        error,
        meta: {
          entity: data?.entity,
          entityId: data?.entityId,
          auditAction: data?.action,
          status: data?.status,
        },
      });
    }
  }

  private async createNotificationsFromAudit(data: AuditNotificationData) {
    const config = CONTENT_ENTITIES[data.entity];
    if (!config || !data.actorId) return;

    try {
      const actor = await this.getActorSnapshot(data.actorId);
      if (!actor) return;

      if (data.action === 'CREATE') {
        if (data.path.endsWith('/import')) {
          await this.notifyBulkCreation(data, config, actor);
          return;
        }

        await this.notifyContentCreation(data, config, actor);
        return;
      }

      if (data.action !== 'UPDATE') return;

      if (this.isReviewPath(data.path)) {
        await this.notifyReviewAction(data, config, actor);
        return;
      }

      await this.notifyNonDraftEdit(data, config, actor);
    } catch (error) {
      this.logger.error('Failed to create audit notifications', {
        context: 'AuditInterceptor',
        action: 'AUDIT_NOTIFICATION_FAILED',
        userId: data.actorId,
        path: data.path,
        error,
        meta: {
          entity: data.entity,
          entityId: data.entityId,
          auditAction: data.action,
        },
      });
    }
  }

  private async notifyContentCreation(
    data: AuditNotificationData,
    config: ContentEntityConfig,
    actor: ActorSnapshot,
  ) {
    const content =
      (await this.getContentSnapshot(data.entity, data.entityId)) ||
      data.newValues;
    const itemLabel = this.getItemLabel(config, content);
    const statusLabel = this.translateApprovalStatus(
      content?.approvalStatus || data.newValues?.approvalStatus,
    );
    const notifications: NotificationDraft[] = [];

    const admins = await this.getActiveAdminsExcept(actor.id);
    notifications.push(
      ...admins.map((admin) => ({
        userId: admin.id,
        title: config.createTitle,
        message: `${actor.name} criou ${config.label} "${itemLabel}". O registo ficou em ${statusLabel} e deve ser acompanhado no fluxo editorial.`,
        type: 'CONTENT_CREATED',
        entity: data.entity,
        entityId: data.entityId,
      })),
    );

    if (actor.role === UserRole.OPERATOR && actor.supervisorId) {
      const supervisor = await this.getActiveUser(actor.supervisorId);
      if (supervisor) {
        notifications.push({
          userId: supervisor.id,
          title: config.createTitle,
          message: `O operador ${actor.name} criou ${config.label} "${itemLabel}". O registo ficou em ${statusLabel} e pode ser acompanhado na fila de supervisão.`,
          type: 'OPERATOR_CONTENT_CREATED',
          entity: data.entity,
          entityId: data.entityId,
        });
      }
    }

    await this.persistNotifications(notifications);
  }

  private async notifyBulkCreation(
    data: AuditNotificationData,
    config: ContentEntityConfig,
    actor: ActorSnapshot,
  ) {
<<<<<<< Updated upstream
    const result = data.result && typeof data.result === 'object' ? data.result as Record<string, unknown> : null;
    const created = Array.isArray(result?.created) ? result.created : [];
    const successCount = Number(result?.successCount || created.length || 0);
=======
    const successCount = Number(
      data.result?.successCount || data.result?.created?.length || 0,
    );
>>>>>>> Stashed changes
    if (!successCount) return;

    const notifications: NotificationDraft[] = [];
    const title = `Importação de ${config.pluralLabel} concluída`;
<<<<<<< Updated upstream
    const firstCreated = created[0];
    const entityId = firstCreated && typeof firstCreated === 'object' && 'id' in firstCreated && typeof firstCreated.id === 'string'
      ? firstCreated.id
=======
    const entityId = Array.isArray(data.result?.created)
      ? data.result.created[0]?.id
>>>>>>> Stashed changes
      : null;

    const admins = await this.getActiveAdminsExcept(actor.id);
    notifications.push(
      ...admins.map((admin) => ({
        userId: admin.id,
        title,
        message: `${actor.name} importou ${successCount} registo${successCount > 1 ? 's' : ''} em ${config.pluralLabel}. Os novos dados ficaram em rascunho e devem seguir o fluxo editorial normal.`,
        type: 'CONTENT_IMPORTED',
        entity: data.entity,
        entityId,
      })),
    );

    if (actor.role === UserRole.OPERATOR && actor.supervisorId) {
      const supervisor = await this.getActiveUser(actor.supervisorId);
      if (supervisor) {
        notifications.push({
          userId: supervisor.id,
          title,
          message: `O operador ${actor.name} importou ${successCount} registo${successCount > 1 ? 's' : ''} em ${config.pluralLabel}. Os dados ficaram em rascunho para acompanhamento.`,
          type: 'OPERATOR_CONTENT_IMPORTED',
          entity: data.entity,
          entityId,
        });
      }
    }

    await this.persistNotifications(notifications);
  }

  private async notifyReviewAction(
    data: AuditNotificationData,
    config: ContentEntityConfig,
    actor: ActorSnapshot,
  ) {
    if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.SUPERVISOR)
      return;

    const oldStatus = data.oldValues?.approvalStatus;
<<<<<<< Updated upstream
    const result = data.result && typeof data.result === 'object' ? data.result as Record<string, unknown> : null;
    const newStatus = data.newValues?.approvalStatus || (typeof result?.approvalStatus === 'string' ? result.approvalStatus : null);
=======
    const newStatus =
      data.newValues?.approvalStatus || data.result?.approvalStatus;
>>>>>>> Stashed changes
    if (!newStatus || oldStatus === newStatus) return;

    const content =
      (await this.getContentSnapshot(data.entity, data.entityId)) ||
      data.newValues ||
      data.oldValues;
    const itemLabel = this.getItemLabel(config, content);
    const reason = this.getReviewReason(data.newValues);
    const reasonText = reason ? ` Observação: ${reason}` : '';
    const statusText = `de ${this.translateApprovalStatus(oldStatus)} para ${this.translateApprovalStatus(newStatus)}`;
    const notifications: NotificationDraft[] = [];

    const admins = await this.getActiveAdminsExcept(actor.id);
    notifications.push(
      ...admins.map((admin) => ({
        userId: admin.id,
        title: 'Ato de supervisão registado',
        message: `${actor.name} alterou o estado ${config.articlePhrase} "${itemLabel}" ${statusText}.${reasonText}`,
        type: 'CONTENT_SUPERVISION',
        entity: data.entity,
        entityId: data.entityId,
      })),
    );

    const creatorId =
      content?.createdById ||
      data.oldValues?.createdById ||
      data.newValues?.createdById;
    if (creatorId && creatorId !== actor.id) {
      const creator = await this.getActiveUser(creatorId);
      if (creator?.role === UserRole.OPERATOR) {
        notifications.push({
          userId: creator.id,
          title: config.statusTitle,
          message: `${actor.name} alterou o estado ${config.articlePhrase} "${itemLabel}" ${statusText}.${reasonText}`,
          type: 'CONTENT_STATUS_CHANGED',
          entity: data.entity,
          entityId: data.entityId,
        });
      }
    }

    await this.persistNotifications(notifications);
  }

  private async notifyNonDraftEdit(
    data: AuditNotificationData,
    config: ContentEntityConfig,
    actor: ActorSnapshot,
  ) {
    const oldStatus = data.oldValues?.approvalStatus;
    if (!oldStatus || oldStatus === ApprovalStatus.DRAFT) return;

    const creatorId =
      data.oldValues?.createdById || data.newValues?.createdById;
    if (creatorId && creatorId === actor.id) return;

    const content =
      (await this.getContentSnapshot(data.entity, data.entityId)) ||
      data.newValues ||
      data.oldValues;
    const itemLabel = this.getItemLabel(config, content);
    const changedFields = this.getChangedFields(data.oldValues, data.newValues);
    const changedText = changedFields.length
      ? ` Campos alterados: ${changedFields.map((field) => this.translateField(field)).join(', ')}.`
      : '';

    const admins = await this.getActiveAdminsExcept(actor.id);
    await this.persistNotifications(
      admins.map((admin) => ({
        userId: admin.id,
        title: 'Conteúdo não rascunho editado',
        message: `${actor.name} editou ${config.articlePhrase} "${itemLabel}", que estava em ${this.translateApprovalStatus(oldStatus)}.${changedText} Verifique se a alteração continua adequada ao fluxo editorial.`,
        type: 'PUBLISHED_CONTENT_UPDATED',
        entity: data.entity,
        entityId: data.entityId,
      })),
    );
  }

  private async getActorSnapshot(
    actorId: string,
  ): Promise<ActorSnapshot | null> {
    return this.prisma.user.findUnique({
      where: { id: actorId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        supervisorId: true,
      },
    });
  }

  private async getContentSnapshot(
    entity: string,
    entityId?: string | null,
  ): Promise<ContentSnapshot | null> {
    if (!entityId || entityId === 'import') return null;

    const config = CONTENT_ENTITIES[entity];
    if (!config) return null;

    const delegate = this.getDelegate(config.delegateName);
    if (!delegate) return null;

    return delegate.findUnique({
      where: { id: entityId },
      select: {
        id: true,
        [config.itemKey]: true,
        approvalStatus: true,
        createdById: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            supervisorId: true,
          },
        },
      },
    }) as Promise<ContentSnapshot | null>;
  }

  private async getActiveAdminsExcept(actorId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.ADMIN,
        isActive: true,
        ...(actorId ? { NOT: { id: actorId } } : {}),
      },
      select: { id: true },
    });
  }

  private async getActiveUser(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, isActive: true },
      select: { id: true, role: true },
    });
  }

  private async persistNotifications(notifications: NotificationDraft[]) {
    const uniqueByUser = new Map<string, NotificationDraft>();

    for (const notification of notifications) {
      if (!notification.userId || uniqueByUser.has(notification.userId))
        continue;
      uniqueByUser.set(notification.userId, notification);
    }

    const data = Array.from(uniqueByUser.values());
    if (data.length === 0) return;

    await this.prisma.notification.createMany({ data });
  }

  private isReviewPath(path: string) {
    return path.split('/').filter(Boolean).includes('review');
  }

  private getItemLabel(
    config: ContentEntityConfig,
    value: Record<string, unknown> | null,
  ) {
    const label = value?.[config.itemKey];
    if (typeof label === 'string' && label.trim()) return label.trim();
    return `registo de ${config.label}`;
  }

  private getReviewReason(value: Record<string, unknown> | null) {
    const reason = value?.rejectionReason || value?.correctionNotes;
    return typeof reason === 'string' && reason.trim() ? reason.trim() : '';
  }

  private translateApprovalStatus(status?: string | null) {
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      PENDING_APPROVAL: 'Pendente de aprovação',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
      NEEDS_CORRECTION: 'Precisa de correção',
      ARCHIVED: 'Arquivado',
    };

    return labels[status || ''] || 'estado não informado';
  }

  private translateField(field: string) {
    const labels: Record<string, string> = {
      entry: 'entrada',
      firstDefinition: 'primeira definição',
      toponym: 'topónimo',
      province: 'província',
      name: 'nome próprio',
      term: 'vocábulo estrangeiro',
      approvalStatus: 'estado',
      rejectionReason: 'motivo de rejeição',
      correctionNotes: 'notas de correção',
      updatedById: 'responsável pela edição',
    };

    return labels[field] || field;
  }

  private getDelegate(name: string) {
    const delegates: Record<
      string,
      {
        findUnique: (args: {
          where: { id: string };
          select?: Record<string, unknown>;
        }) => Promise<unknown>;
      }
    > = {
      entry: this.prisma.entry,
      neologism: this.prisma.neologism,
      toponym: this.prisma.toponym,
      anthroponym: this.prisma.anthroponym,
      foreignism: this.prisma.foreignism,
      blogPost: this.prisma.blogPost,
      event: this.prisma.event,
      eventRegistration: this.prisma.eventRegistration,
      user: this.prisma.user,
      mediaAsset: this.prisma.mediaAsset,
    };
    return delegates[name];
  }
}

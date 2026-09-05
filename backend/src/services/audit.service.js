const mongoose = require('mongoose');
const { db } = require('../config/database');
const AuditEvent = require('../models/AuditEvent');
const AuditLog = require('../models/AuditLog');

class AuditService {
  /**
   * Log an audit event, persisting to MongoDB if connected and in-memory store.
   * @param {Object} data
   * @returns {Object} normalized event
   */
  static log(data) {
    const event = new AuditEvent(data);

    // Keep in-memory store in sync
    db.auditEvents.push(event);

    // Persist to MongoDB via Mongoose AuditLog Schema if available
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const auditDoc = new AuditLog({
          eventId: event.eventId,
          timestamp: new Date(event.timestamp),
          agentId: event.agentId,
          actor: event.actor || event.agentId,
          sessionId: event.sessionId,
          relatedSessionId: event.relatedSessionId || event.sessionId,
          action: event.action,
          status: event.status,
          result: event.result || event.status,
          decision: event.decision,
          reason: event.reason,
          metadata: event.metadata || {},
          requestId: event.requestId,
          relatedOrderId: event.relatedOrderId,
          relatedReceiptId: event.relatedReceiptId,
        });

        auditDoc.save().catch(err => {
          console.warn('⚠️ Error saving AuditLog to MongoDB:', err.message);
        });
      }
    } catch (err) {
      console.warn('⚠️ Mongoose AuditLog model error:', err.message);
    }

    return event;
  }

  /**
   * Query audit logs sorted by timestamp: -1 with optional filtering.
   * @param {Object} filters { agentId, action, status, limit, actor, result }
   * @returns {Promise<Array>|Array}
   */
  static async getAuditLogs(filters = {}) {
    // 1. Try querying MongoDB via Mongoose if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const query = {};
        const agentFilter = filters.agentId || filters.actor;
        if (agentFilter && agentFilter !== 'ALL') {
          query.$or = [{ agentId: agentFilter }, { actor: agentFilter }];
        }
        if (filters.action && filters.action !== 'ALL') {
          query.action = filters.action;
        }
        const statusFilter = filters.status || filters.result;
        if (statusFilter && statusFilter !== 'ALL') {
          query.$or = [{ status: statusFilter }, { result: statusFilter }];
        }

        let mongoQuery = AuditLog.find(query).sort({ timestamp: -1 });
        if (filters.limit) {
          mongoQuery = mongoQuery.limit(parseInt(filters.limit, 10));
        }

        const docs = await mongoQuery.lean().exec();
        if (docs && docs.length > 0) {
          return docs.map(doc => ({
            ...doc,
            id: doc.eventId || doc.id,
            timestamp: doc.timestamp instanceof Date ? doc.timestamp.toISOString() : doc.timestamp,
          }));
        }
      } catch (err) {
        console.warn('⚠️ MongoDB query failed, falling back to in-memory store:', err.message);
      }
    }

    // 2. Fallback to in-memory store
    return this.getEvents(filters);
  }

  /**
   * Synchronous getEvents for backward compatibility.
   */
  static getEvents(filters = {}) {
    let list = [...db.auditEvents];

    const agentFilter = filters.agentId || filters.actor;
    if (agentFilter && agentFilter !== 'ALL') {
      list = list.filter(e => e.agentId === agentFilter || e.actor === agentFilter);
    }

    if (filters.action && filters.action !== 'ALL') {
      list = list.filter(e => e.action === filters.action);
    }

    const statusFilter = filters.status || filters.result;
    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter(e => e.status === statusFilter || e.result === statusFilter);
    }

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters.limit) {
      list = list.slice(0, parseInt(filters.limit, 10));
    }

    return list;
  }
}

module.exports = AuditService;

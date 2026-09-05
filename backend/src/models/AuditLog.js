const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    agentId: {
      type: String,
      default: 'SYSTEM',
      index: true,
    },
    actor: {
      type: String,
      default: function () {
        return this.agentId || 'SYSTEM';
      },
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
    relatedSessionId: {
      type: String,
      default: function () {
        return this.sessionId || null;
      },
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      default: 'INFO',
      enum: ['SUCCESS', 'BLOCKED', 'WARNING', 'INFO'],
      index: true,
    },
    result: {
      type: String,
      default: function () {
        return this.status || 'INFO';
      },
    },
    decision: {
      type: String,
      default: function () {
        return this.status === 'BLOCKED' ? 'BLOCK' : 'ALLOW';
      },
    },
    reason: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestId: {
      type: String,
      default: null,
    },
    relatedOrderId: {
      type: String,
      default: null,
    },
    relatedReceiptId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.eventId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ agentId: 1, timestamp: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

module.exports = AuditLog;

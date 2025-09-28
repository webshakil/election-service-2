class NotificationService {
  // Send election activated notification
  async sendElectionActivatedNotification(electionId) {
    try {
      // This would integrate with email/SMS/push notification services
      console.log(`Election ${electionId} activated - notifications sent`);
      
      // Implementation would include:
      // - Email to election creator
      // - Push notifications to subscribers
      // - Webhook to external systems

    } catch (error) {
      console.error('Send election activated notification error:', error);
    }
  }

  // Send lottery executed notification
  async sendLotteryExecutedNotification(electionId, winners) {
    try {
      console.log(`Lottery executed for election ${electionId} with ${winners.length} winners`);
      
      // Implementation would include:
      // - Email to election creator
      // - Email to winners
      // - Public announcement
      // - Social media integration

    } catch (error) {
      console.error('Send lottery executed notification error:', error);
    }
  }

  // Send prize distribution notification
  async sendPrizeDistributionNotification(electionId, distributionResults) {
    try {
      console.log(`Prizes distributed for election ${electionId}`);
      
      // Implementation would include:
      // - Email to winners with prize details
      // - Transaction confirmations
      // - Tax documentation if required

    } catch (error) {
      console.error('Send prize distribution notification error:', error);
    }
  }

  // Send general notification
  async sendNotification(userId, type, title, message, data = {}) {
    try {
      console.log(`Notification sent to user ${userId}: ${title}`);
      
      // Implementation would include:
      // - Store in database
      // - Send via preferred channels (email, SMS, push)
      // - Webhook integrations

    } catch (error) {
      console.error('Send notification error:', error);
    }
  }

  // Send question created notification
  async sendQuestionCreatedNotification(electionId, questionId) {
    try {
      console.log(`Question ${questionId} created for election ${electionId}`);
      
      // Implementation would include:
      // - Notification to election creator
      // - Update election status if needed

    } catch (error) {
      console.error('Send question created notification error:', error);
    }
  }

  // Send file upload notification
  async sendFileUploadNotification(userId, fileName, fileUrl) {
    try {
      console.log(`File ${fileName} uploaded by user ${userId}`);
      
      // Implementation would include:
      // - Confirmation to user
      // - Admin notification for large files

    } catch (error) {
      console.error('Send file upload notification error:', error);
    }
  }

  // Send security alert notification
  async sendSecurityAlertNotification(userId, alertType, details) {
    try {
      console.log(`Security alert for user ${userId}: ${alertType}`);
      
      // Implementation would include:
      // - Immediate email/SMS alert
      // - Admin notification
      // - Security team notification

    } catch (error) {
      console.error('Send security alert notification error:', error);
    }
  }

  // Send system maintenance notification
  async sendMaintenanceNotification(message, scheduledTime) {
    try {
      console.log(`Maintenance notification: ${message} at ${scheduledTime}`);
      
      // Implementation would include:
      // - Broadcast to all users
      // - Email notifications
      // - In-app notifications

    } catch (error) {
      console.error('Send maintenance notification error:', error);
    }
  }

  // Send welcome notification to new users
  async sendWelcomeNotification(userId, userType) {
    try {
      console.log(`Welcome notification sent to user ${userId} (${userType})`);
      
      // Implementation would include:
      // - Welcome email with platform guide
      // - Onboarding sequence
      // - Feature highlights based on user type

    } catch (error) {
      console.error('Send welcome notification error:', error);
    }
  }

  // Send subscription notification
  async sendSubscriptionNotification(userId, subscriptionType, action) {
    try {
      console.log(`Subscription ${action} notification for user ${userId}: ${subscriptionType}`);
      
      // Implementation would include:
      // - Email confirmation
      // - Feature access updates
      // - Billing notifications

    } catch (error) {
      console.error('Send subscription notification error:', error);
    }
  }

  // Send bulk notification
  async sendBulkNotification(userIds, type, title, message, data = {}) {
    try {
      console.log(`Bulk notification sent to ${userIds.length} users: ${title}`);
      
      // Implementation would include:
      // - Batch processing
      // - Queue management
      // - Delivery tracking

      for (const userId of userIds) {
        await this.sendNotification(userId, type, title, message, data);
      }

    } catch (error) {
      console.error('Send bulk notification error:', error);
    }
  }

  // Send email notification
  async sendEmailNotification(email, subject, content, templateId = null) {
    try {
      console.log(`Email notification sent to ${email}: ${subject}`);
      
      // Implementation would include:
      // - Email service integration (SendGrid, AWS SES, etc.)
      // - Template processing
      // - Delivery tracking
      // - Bounce handling

    } catch (error) {
      console.error('Send email notification error:', error);
    }
  }

  // Send SMS notification
  async sendSMSNotification(phoneNumber, message) {
    try {
      console.log(`SMS notification sent to ${phoneNumber}`);
      
      // Implementation would include:
      // - SMS service integration (Twilio, AWS SNS, etc.)
      // - International number formatting
      // - Delivery confirmation

    } catch (error) {
      console.error('Send SMS notification error:', error);
    }
  }

  // Send push notification
  async sendPushNotification(userId, title, message, data = {}) {
    try {
      console.log(`Push notification sent to user ${userId}: ${title}`);
      
      // Implementation would include:
      // - Firebase Cloud Messaging
      // - Device token management
      // - Platform-specific formatting

    } catch (error) {
      console.error('Send push notification error:', error);
    }
  }

  // Send webhook notification
  async sendWebhookNotification(webhookUrl, event, data) {
    try {
      console.log(`Webhook notification sent to ${webhookUrl}: ${event}`);
      
      // Implementation would include:
      // - HTTP POST request
      // - Retry logic
      // - Authentication headers
      // - Signature verification

    } catch (error) {
      console.error('Send webhook notification error:', error);
    }
  }

  // Get notification preferences for user
  async getNotificationPreferences(userId) {
    try {
      // Implementation would return user's notification preferences
      return {
        email: true,
        sms: false,
        push: true,
        webhook: false,
        election_updates: true,
        lottery_updates: true,
        security_alerts: true,
        marketing: false
      };

    } catch (error) {
      console.error('Get notification preferences error:', error);
      return {};
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    try {
      console.log(`Notification preferences updated for user ${userId}`);
      
      // Implementation would update database
      // - Store preferences
      // - Validate settings
      // - Send confirmation

    } catch (error) {
      console.error('Update notification preferences error:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(userId, type, title, message, scheduledTime, data = {}) {
    try {
      console.log(`Notification scheduled for user ${userId} at ${scheduledTime}: ${title}`);
      
      // Implementation would include:
      // - Job queue integration
      // - Scheduling system
      // - Cancellation support

    } catch (error) {
      console.error('Schedule notification error:', error);
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    try {
      console.log(`Scheduled notification ${notificationId} cancelled`);
      
      // Implementation would remove from queue

    } catch (error) {
      console.error('Cancel scheduled notification error:', error);
    }
  }

  // Get notification history
  async getNotificationHistory(userId, filters = {}) {
    try {
      console.log(`Notification history retrieved for user ${userId}`);
      
      // Implementation would return notification history
      return {
        notifications: [],
        total: 0,
        page: 1,
        limit: 10
      };

    } catch (error) {
      console.error('Get notification history error:', error);
      return null;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId) {
    try {
      console.log(`Notification ${notificationId} marked as read by user ${userId}`);
      
      // Implementation would update database

    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId) {
    try {
      console.log(`All notifications marked as read for user ${userId}`);
      
      // Implementation would update database

    } catch (error) {
      console.error('Mark all notifications as read error:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
// import nodemailer from 'nodemailer';
// import { query } from '../config/database.js';
// import { SUPPORTED_LANGUAGES } from '../config/constants.js';

// class NotificationService {
//   constructor() {
//     this.transporter = null;
//     this.initializeTransporter();
//     this.notificationTable = 'vottery_notifications_2';
//   }

//   // Initialize email transporter
//   initializeTransporter() {
//     try {
//       this.transporter = nodemailer.createTransporter({
//         host: process.env.SMTP_HOST || 'smtp.gmail.com',
//         port: process.env.SMTP_PORT || 587,
//         secure: process.env.SMTP_SECURE === 'true',
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASS
//         },
//         tls: {
//           rejectUnauthorized: false
//         }
//       });

//       console.log('✅ Email transporter initialized');
//     } catch (error) {
//       console.error('❌ Email transporter initialization failed:', error);
//     }
//   }

//   // Send election creation notification
//   async sendElectionCreatedNotification(electionData, creatorEmail) {
//     try {
//       const { title, custom_url, id } = electionData;
//       const votingUrl = `${process.env.FRONTEND_URL}/vote/${custom_url}`;
//       const managementUrl = `${process.env.FRONTEND_URL}/elections/${id}`;

//       const emailContent = {
//         subject: '🗳️ Your Election Has Been Created Successfully',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #2563eb;">Election Created Successfully!</h2>
//             <p>Your election "<strong>${title}</strong>" has been created and is ready to be configured.</p>
            
//             <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
//               <h3>Quick Links:</h3>
//               <ul>
//                 <li><a href="${managementUrl}" style="color: #2563eb;">Manage Election</a></li>
//                 <li><a href="${votingUrl}" style="color: #2563eb;">Voting URL</a></li>
//               </ul>
//             </div>
            
//             <p>Next steps:</p>
//             <ol>
//               <li>Configure your election settings</li>
//               <li>Add questions and options</li>
//               <li>Set access permissions</li>
//               <li>Activate your election</li>
//             </ol>
            
//             <p style="color: #6b7280; font-size: 14px;">
//               This is an automated message from Vottery. Please do not reply to this email.
//             </p>
//           </div>
//         `
//       };

//       await this.sendEmail(creatorEmail, emailContent);
//       await this.logNotification({
//         user_email: creatorEmail,
//         type: 'election_created',
//         subject: emailContent.subject,
//         content: `Election "${title}" created successfully`,
//         metadata: { election_id: id, custom_url }
//       });

//       console.log('✅ Election creation notification sent to:', creatorEmail);
//     } catch (error) {
//       console.error('❌ Failed to send election creation notification:', error);
//     }
//   }

//   // Send election status change notification
//   async sendElectionStatusNotification(electionData, creatorEmail, oldStatus, newStatus) {
//     try {
//       const { title, id, custom_url } = electionData;
//       const managementUrl = `${process.env.FRONTEND_URL}/elections/${id}`;

//       const statusMessages = {
//         active: 'Your election is now live and accepting votes!',
//         paused: 'Your election has been paused.',
//         completed: 'Your election has been completed.',
//         cancelled: 'Your election has been cancelled.'
//       };

//       const emailContent = {
//         subject: `🔄 Election Status Updated: ${title}`,
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #2563eb;">Election Status Updated</h2>
//             <p>The status of your election "<strong>${title}</strong>" has been changed.</p>
            
//             <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
//               <p><strong>Previous Status:</strong> ${oldStatus}</p>
//               <p><strong>New Status:</strong> ${newStatus}</p>
//               <p>${statusMessages[newStatus] || 'Status has been updated.'}</p>
//             </div>
            
//             <p><a href="${managementUrl}" style="color: #2563eb;">View Election Details</a></p>
            
//             <p style="color: #6b7280; font-size: 14px;">
//               This is an automated message from Vottery. Please do not reply to this email.
//             </p>
//           </div>
//         `
//       };

//       await this.sendEmail(creatorEmail, emailContent);
//       await this.logNotification({
//         user_email: creatorEmail,
//         type: 'election_status_changed',
//         subject: emailContent.subject,
//         content: `Election "${title}" status changed from ${oldStatus} to ${newStatus}`,
//         metadata: { election_id: id, old_status: oldStatus, new_status: newStatus }
//       });

//       console.log('✅ Election status notification sent to:', creatorEmail);
//     } catch (error) {
//       console.error('❌ Failed to send election status notification:', error);
//     }
//   }

//   // Send lottery winner notification
//   async sendLotteryWinnerNotification(winnerData, electionData) {
//     try {
//       const { winner_email, winner_name, prize_amount, prize_description, rank } = winnerData;
//       const { title, id } = electionData;

//       const emailContent = {
//         subject: '🎉 Congratulations! You Won in Vottery Lottery!',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #059669;">🎉 Congratulations ${winner_name}!</h2>
//             <p>You are a winner in the lottery for election "<strong>${title}</strong>"!</p>
            
//             <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
//               <h3>Your Prize Details:</h3>
//               <p><strong>Position:</strong> ${rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : rank === 3 ? '3rd Place' : `${rank}th Place`}</p>
//               ${prize_amount ? `<p><strong>Prize Amount:</strong> $${prize_amount}</p>` : ''}
//               ${prize_description ? `<p><strong>Prize Description:</strong> ${prize_description}</p>` : ''}
//             </div>
            
//             <p>Instructions for claiming your prize will be sent to you separately within 24-48 hours.</p>
            
//             <p style="color: #6b7280; font-size: 14px;">
//               This is an automated message from Vottery. Please do not reply to this email.
//             </p>
//           </div>
//         `
//       };

//       await this.sendEmail(winner_email, emailContent);
//       await this.logNotification({
//         user_email: winner_email,
//         type: 'lottery_winner',
//         subject: emailContent.subject,
//         content: `Winner notification for election "${title}"`,
//         metadata: { election_id: id, prize_amount, rank }
//       });

//       console.log('✅ Lottery winner notification sent to:', winner_email);
//     } catch (error) {
//       console.error('❌ Failed to send lottery winner notification:', error);
//     }
//   }

//   // Send content creator integration notification
//   async sendContentCreatorNotification(creatorData, electionData) {
//     try {
//       const { email, name } = creatorData;
//       const { title, custom_url, id, voting_url } = electionData;

//       const emailContent = {
//         subject: '📹 Your Content Creator Election is Ready!',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #7c3aed;">Content Creator Integration Ready!</h2>
//             <p>Hi ${name},</p>
//             <p>Your election "<strong>${title}</strong>" is now ready for content creator integration!</p>
            
//             <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
//               <h3>Integration Details:</h3>
//               <p><strong>Voting URL:</strong> <code>${voting_url}</code></p>
//               <p><strong>Custom URL:</strong> ${custom_url}</p>
//               <p><strong>Unique Links:</strong> Will be generated per viewer</p>
//             </div>
            
//             <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
//               <h4>Next Steps:</h4>
//               <ol>
//                 <li>Embed the Vottery icon in your content</li>
//                 <li>Keep icon hidden until content end</li>
//                 <li>Unique voting links will be generated automatically</li>
//                 <li>Winners will be announced after election ends</li>
//               </ol>
//             </div>
            
//             <p style="color: #6b7280; font-size: 14px;">
//               This is an automated message from Vottery. Please do not reply to this email.
//             </p>
//           </div>
//         `
//       };

//       await this.sendEmail(email, emailContent);
//       await this.logNotification({
//         user_email: email,
//         type: 'content_creator_ready',
//         subject: emailContent.subject,
//         content: `Content creator integration ready for election "${title}"`,
//         metadata: { election_id: id, custom_url }
//       });

//       console.log('✅ Content creator notification sent to:', email);
//     } catch (error) {
//       console.error('❌ Failed to send content creator notification:', error);
//     }
//   }

//   // Send subscription required notification
//   async sendSubscriptionRequiredNotification(userEmail, userName, requiredFeature) {
//     try {
//       const emailContent = {
//         subject: '⭐ Subscription Required for Premium Features',
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #dc2626;">Subscription Required</h2>
//             <p>Hi ${userName},</p>
//             <p>You've reached the limits of your free account. To access <strong>${requiredFeature}</strong>, please upgrade to a premium subscription.</p>
            
//             <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
//               <h3>Premium Features Include:</h3>
//               <ul>
//                 <li>Unlimited election creation</li>
//                 <li>Custom branding and logos</li>
//                 <li>Advanced analytics</li>
//                 <li>Content creator integration</li>
//                 <li>Priority support</li>
//               </ul>
//             </div>
            
//             <p><a href="${process.env.FRONTEND_URL}/subscription" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Upgrade Now</a></p>
            
//             <p style="color: #6b7280; font-size: 14px;">
//               This is an automated message from Vottery. Please do not reply to this email.
//             </p>
//           </div>
//         `
//       };

//       await this.sendEmail(userEmail, emailContent);
//       await this.logNotification({
//         user_email: userEmail,
//         type: 'subscription_required',
//         subject: emailContent.subject,
//         content: `Subscription required for feature: ${requiredFeature}`,
//         metadata: { required_feature: requiredFeature }
//       });

//       console.log('✅ Subscription required notification sent to:', userEmail);
//     } catch (error) {
//       console.error('❌ Failed to send subscription notification:', error);
//     }
//   }

//   // Send email utility
//   async sendEmail(to, emailContent) {
//     if (!this.transporter) {
//       throw new Error('Email transporter not initialized');
//     }

//     const mailOptions = {
//       from: `"Vottery Platform" <${process.env.SMTP_USER}>`,
//       to: to,
//       subject: emailContent.subject,
//       html: emailContent.html,
//       text: emailContent.text || emailContent.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
//     };

//     return await this.transporter.sendMail(mailOptions);
//   }

//   // Log notification to database
//   async logNotification(notificationData) {
//     try {
//       const {
//         user_email,
//         type,
//         subject,
//         content,
//         metadata = {},
//         status = 'sent'
//       } = notificationData;

//       const sql = `
//         INSERT INTO ${this.notificationTable} (
//           user_email, type, subject, content, metadata, status, created_at
//         ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
//         RETURNING *
//       `;

//       const values = [
//         user_email,
//         type,
//         subject,
//         content,
//         JSON.stringify(metadata),
//         status
//       ];

//       const result = await query(sql, values);
//       return result.rows[0];
//     } catch (error) {
//       console.error('❌ Failed to log notification:', error);
//     }
//   }

//   // Get user notifications
//   async getUserNotifications(userEmail, options = {}) {
//     try {
//       const { limit = 20, offset = 0, type = null } = options;

//       let sql = `
//         SELECT * FROM ${this.notificationTable}
//         WHERE user_email = $1
//       `;

//       const values = [userEmail];
//       let paramCount = 1;

//       if (type) {
//         paramCount++;
//         sql += ` AND type = $${paramCount}`;
//         values.push(type);
//       }

//       sql += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
//       values.push(limit, offset);

//       const result = await query(sql, values);
//       return result.rows.map(row => ({
//         ...row,
//         metadata: JSON.parse(row.metadata || '{}')
//       }));
//     } catch (error) {
//       console.error('❌ Failed to get user notifications:', error);
//       return [];
//     }
//   }

//   // Send multi-language notification
//   async sendMultiLanguageNotification(recipientData, templateKey, templateData, language = 'en-US') {
//     try {
//       const templates = await this.getNotificationTemplates(templateKey, language);
      
//       const processedContent = this.processTemplate(templates, templateData);
      
//       await this.sendEmail(recipientData.email, processedContent);
      
//       console.log(`✅ Multi-language notification sent (${language}) to:`, recipientData.email);
//     } catch (error) {
//       console.error('❌ Failed to send multi-language notification:', error);
//     }
//   }

//   // Get notification templates (placeholder for future implementation)
//   async getNotificationTemplates(templateKey, language) {
//     // This would typically fetch from a database or translation service
//     const defaultTemplates = {
//       election_created: {
//         subject: '🗳️ Your Election Has Been Created Successfully',
//         html: '<div>Election "{{title}}" has been created successfully.</div>'
//       }
//     };

//     return defaultTemplates[templateKey] || defaultTemplates.election_created;
//   }

//   // Process template with data
//   processTemplate(template, data) {
//     let processed = { ...template };
    
//     Object.keys(data).forEach(key => {
//       const placeholder = `{{${key}}}`;
//       processed.subject = processed.subject.replace(new RegExp(placeholder, 'g'), data[key]);
//       processed.html = processed.html.replace(new RegExp(placeholder, 'g'), data[key]);
//     });

//     return processed;
//   }

//   // Send bulk notifications
//   async sendBulkNotifications(recipients, emailContent, batchSize = 50) {
//     try {
//       const batches = [];
//       for (let i = 0; i < recipients.length; i += batchSize) {
//         batches.push(recipients.slice(i, i + batchSize));
//       }

//       const results = [];
//       for (const batch of batches) {
//         const batchPromises = batch.map(recipient => 
//           this.sendEmail(recipient.email, emailContent)
//             .then(() => ({ email: recipient.email, status: 'sent' }))
//             .catch(error => ({ email: recipient.email, status: 'failed', error: error.message }))
//         );

//         const batchResults = await Promise.allSettled(batchPromises);
//         results.push(...batchResults.map(result => result.value));

//         // Small delay between batches to avoid overwhelming SMTP server
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }

//       return results;
//     } catch (error) {
//       console.error('❌ Failed to send bulk notifications:', error);
//       throw error;
//     }
//   }
// }

// export default new NotificationService();
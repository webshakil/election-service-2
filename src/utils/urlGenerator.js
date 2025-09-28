import slugify from 'slugify';
import { randomBytes } from 'node:crypto';

class URLGenerator {
  // Generate custom voting URL
  static generateVotingURL(baseText, electionId) {
    const slug = slugify(baseText, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Ensure uniqueness by adding election ID
    const shortId = electionId.toString(36);
    return `${slug}-${shortId}`;
  }

  // Generate secure one-time voting link
  static generateOneTimeLink(electionId, userId, baseURL = '') {
    const token = randomBytes(32).toString('base64url');
    const timestamp = Date.now();
    const signature = this.generateLinkSignature(electionId, userId, token, timestamp);
    
    const params = new URLSearchParams({
      t: timestamp.toString(),
      sig: signature,
      u: userId.toString()
    });
    
    return {
      token,
      url: `${baseURL}/vote/${electionId}/${token}?${params.toString()}`,
      expires_at: new Date(timestamp + (24 * 60 * 60 * 1000)) // 24 hours
    };
  }

  // Generate signature for link verification
  static async generateLinkSignature(electionId, userId, token, timestamp) {
    const crypto = await import('node:crypto');
    const data = `${electionId}:${userId}:${token}:${timestamp}`;
    const secret = process.env.SIGNATURE_SECRET || 'default-secret';
    
    return crypto.createHash('sha256')
      .update(data + secret)
      .digest('hex');
  }

  // Generate content creator voting icon URL
  static generateVotteryIconURL(electionId, customData = {}) {
    const params = new URLSearchParams({
      election: electionId.toString(),
      type: 'icon',
      ...customData
    });
    
    return `/api/icons/vottery?${params.toString()}`;
  }

  // Generate election sharing URL
  static generateSharingURL(election, baseURL = '') {
    const slug = this.generateVotingURL(election.title, election.id);
    const customURL = election.custom_voting_url || slug;
    
    return {
      short_url: `${baseURL}/vote/${customURL}`,
      full_url: `${baseURL}/elections/${election.unique_election_id}`,
      qr_code_url: `${baseURL}/api/qr/${election.unique_election_id}`,
      embed_url: `${baseURL}/embed/${election.unique_election_id}`
    };
  }

  // Generate API endpoint URLs
  static generateAPIEndpoints(electionId, baseURL = '') {
    return {
      election: `${baseURL}/api/elections/${electionId}`,
      questions: `${baseURL}/api/questions/elections/${electionId}/questions`,
      lottery: `${baseURL}/api/lottery/elections/${electionId}/status`,
      stats: `${baseURL}/api/elections/${electionId}/stats`,
      export: `${baseURL}/api/elections/${electionId}/export`
    };
  }

  // Generate social media sharing URLs
  static generateSocialSharingURLs(election, baseURL = '') {
    const shareURL = this.generateSharingURL(election, baseURL).short_url;
    const title = encodeURIComponent(`Vote in: ${election.title}`);
    const description = encodeURIComponent(election.description || `Participate in this election on Vottery`);
    
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareURL)}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareURL)}`,
      whatsapp: `https://wa.me/?text=${title}%20${encodeURIComponent(shareURL)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareURL)}&text=${title}`,
      email: `mailto:?subject=${title}&body=${description}%0A%0A${encodeURIComponent(shareURL)}`
    };
  }

  // Generate webhook URLs for integrations
  static generateWebhookURLs(electionId, baseURL = '') {
    return {
      election_created: `${baseURL}/webhooks/election/${electionId}/created`,
      election_activated: `${baseURL}/webhooks/election/${electionId}/activated`,
      election_completed: `${baseURL}/webhooks/election/${electionId}/completed`,
      vote_cast: `${baseURL}/webhooks/election/${electionId}/vote`,
      lottery_executed: `${baseURL}/webhooks/election/${electionId}/lottery`
    };
  }

  // Generate content creator embed URLs
  static generateContentCreatorURLs(election, creatorConfig = {}) {
    const baseParams = {
      election_id: election.id,
      creator: creatorConfig.creator_id || '',
      theme: creatorConfig.theme || 'default'
    };
    
    return {
      embed_script: `/embed/script/${election.unique_election_id}?${new URLSearchParams(baseParams)}`,
      iframe_url: `/embed/iframe/${election.unique_election_id}?${new URLSearchParams(baseParams)}`,
      popup_url: `/embed/popup/${election.unique_election_id}?${new URLSearchParams(baseParams)}`,
      widget_url: `/embed/widget/${election.unique_election_id}?${new URLSearchParams(baseParams)}`
    };
  }

  // Generate verification URLs
  static generateVerificationURLs(electionId, baseURL = '') {
    return {
      election_integrity: `${baseURL}/verify/election/${electionId}`,
      vote_verification: `${baseURL}/verify/votes/${electionId}`,
      lottery_verification: `${baseURL}/verify/lottery/${electionId}`,
      audit_trail: `${baseURL}/audit/${electionId}`
    };
  }

  // Generate admin dashboard URLs
  static generateAdminURLs(electionId, baseURL = '') {
    return {
      dashboard: `${baseURL}/admin/elections/${electionId}`,
      analytics: `${baseURL}/admin/elections/${electionId}/analytics`,
      moderation: `${baseURL}/admin/elections/${electionId}/moderate`,
      settings: `${baseURL}/admin/elections/${electionId}/settings`,
      audit: `${baseURL}/admin/elections/${electionId}/audit`
    };
  }

  // Generate mobile app deep links
  static generateMobileDeepLinks(election) {
    const electionId = election.unique_election_id;
    
    return {
      ios: `vottery://election/${electionId}`,
      android: `intent://election/${electionId}#Intent;scheme=vottery;package=com.vottery.app;end`,
      universal: `https://app.vottery.com/election/${electionId}`
    };
  }

  // Generate QR code data URLs
  static generateQRCodeData(election, baseURL = '') {
    const votingURL = this.generateSharingURL(election, baseURL).short_url;
    
    return {
      voting_url: votingURL,
      qr_api_url: `/api/qr/generate?data=${encodeURIComponent(votingURL)}`,
      verification_url: this.generateVerificationURLs(election.id, baseURL).election_integrity
    };
  }

  // Generate file download URLs
  static generateDownloadURLs(electionId, baseURL = '') {
    return {
      csv_export: `${baseURL}/api/elections/${electionId}/export?format=csv`,
      json_export: `${baseURL}/api/elections/${electionId}/export?format=json`,
      pdf_report: `${baseURL}/api/elections/${electionId}/report?format=pdf`,
      audit_log: `${baseURL}/api/elections/${electionId}/audit/export`
    };
  }

  // Generate pagination URLs
  static generatePaginationURLs(baseURL, currentPage, totalPages, queryParams = {}) {
    const buildURL = (page) => {
      const params = new URLSearchParams({ ...queryParams, page: page.toString() });
      return `${baseURL}?${params.toString()}`;
    };
    
    return {
      first: buildURL(1),
      previous: currentPage > 1 ? buildURL(currentPage - 1) : null,
      current: buildURL(currentPage),
      next: currentPage < totalPages ? buildURL(currentPage + 1) : null,
      last: buildURL(totalPages)
    };
  }

  // Validate and sanitize custom URL
  static validateCustomURL(customURL) {
    // Remove invalid characters
    const cleaned = customURL
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure minimum length
    if (cleaned.length < 3) {
      return null;
    }
    
    // Ensure maximum length
    if (cleaned.length > 100) {
      return cleaned.substring(0, 100);
    }
    
    // Check for reserved words
    const reserved = ['admin', 'api', 'www', 'app', 'vote', 'election', 'create', 'edit', 'delete'];
    if (reserved.includes(cleaned)) {
      return `${cleaned}-election`;
    }
    
    return cleaned;
  }

  // Generate sitemap URLs
  static generateSitemapURLs(elections, baseURL = '') {
    return elections.map(election => ({
      url: this.generateSharingURL(election, baseURL).full_url,
      lastmod: election.updated_at,
      changefreq: election.status === 'active' ? 'daily' : 'weekly',
      priority: election.status === 'active' ? 0.8 : 0.5
    }));
  }

  // Generate RSS feed URLs
  static generateRSSURLs(baseURL = '') {
    return {
      all_elections: `${baseURL}/rss/elections`,
      active_elections: `${baseURL}/rss/elections/active`,
      completed_elections: `${baseURL}/rss/elections/completed`,
      lottery_results: `${baseURL}/rss/lottery/results`
    };
  }
}

export default URLGenerator;
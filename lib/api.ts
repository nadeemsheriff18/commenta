"use client";

import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- INTERFACES ---
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface User {
  user_id: string;
  name: string;
  email: string;
  picture?: string; 
}
export interface Project {
  id: string;
  name: string;
  link: string;
  total_subreddits: number;
  total_mentions: number;
  created_at: string;
}
export interface ProjectSettings {
  name: string;
  prod_url: string;
  prod_info: {
    problem: string;
    audience: string;
    solution: string;
  };
}
export interface Mention {
  id: number;
  subreddit: string;
  title: string;
  text: string;
  score: number;
  comment_cnt: number;
  time: string;
  link: string;
  prio?: "low" | "medium" | "high";
  similarity: number;
  comment?: any;
  is_new?: boolean;
}
export interface MentionsResponse {
  exp: string;
  ments: Mention[];
  total: number;
}
export interface KnowledgeBaseEntry {
  id: number;
  title?: string;
  content: string;
  created_on: string;
}
export interface FounderTemplate {
  id: number;
  photo: string;
  name: string;
  company: string;
  description: string;
  profileText: string;
}
export interface SubredditInfo {
  name: string;
  title: string;
  description: string;
  subscribers: number;
  over18: boolean;
  url: string;
  isSystemAdded?: boolean;
}
export interface ProjectListingResponse {
  total_projects: number;
  total_mentions: number;
  total_subreddits: number;
  projects: Project[];
}
export interface AccountDetails {
  name: string;
  email: string;
  plan_name: string;
  is_expired: boolean;
  expires_on: string;
  active_subreds: number;
  max_subreds: number;
  comments_count: number;
  max_comments: number;
  kb_size: number;
  max_kb_size: number;
}
export interface SubscriptionPlan {
  id: number;
  name: string;
  descrip: string;
  time_gap: number;
  subreddit_count: number;
  comments_per_day: number;
  duration_in_days: number;
  cost: number;
  kb_max_size: number;
}
export interface OverallStats {
    total_projects: number;
    total_mentions: number;
    total_subreddits: number;
}
export interface ProjectStats {
    total_mentions: number;
    total_subreddits: number;
    completed_mentions: number;
    avg_relevance: number;
}

// Data Transfer Interfaces
export interface PaginationParams { page?: number; limit?: number; search?: string; }
export interface CreateProjectData {
  name: string;
  product_link: string;
  product_explanation: { problem: string; audience: string; solution: string; };
}
export interface MentionParams { proj_id: string; hours?: number; ment_type?: 'completed' | 'ignored' | 'noise'; page?: number; limit?: number; }
export interface ActOnMentionData { ment_id: number; type: 'completed' | 'ignored' | 'pinned' | 'noise' | 'active'; comment?: string; }
export interface GenerateCommentData { ment_id: number; is_relvent: boolean; }
export interface AddKnowledgeBaseData { personal_info: Record<string, any>; }
export interface UpdateKnowledgeBaseData { kb_id: number; title: string; content: string; }
export interface DeleteKnowledgeBaseData { kb_id: number; }
export interface AddSubredditsData { proj_id: string; subreddits: string[]; }
export interface DeleteSubredditsData { proj_id: string; subreddits: string[]; }
export interface AddKeywordsData { proj_id: string; keywords: string[]; }
export interface DeleteKeywordsData { proj_id: string; del_keywords: string[]; }
export interface ManualAuthData { email: string; password: string; timezone: string; }
export interface VerifyEmailData { token: string; }
export interface ResetPasswordData { token: string; new_password: string; }
export interface OAuthCallbackData { code: string; timezone: string; }


class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = Cookies.get('auth_token');
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }
      return { success: true, data: data, pagination: data.pagination };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // AUTHENTICATION
  async manualAuth(data: ManualAuthData) { return this.makeRequest('/manual_auth', { method: 'POST', body: JSON.stringify(data) }); }
  async verifyEmail(data: VerifyEmailData) { return this.makeRequest('/verify_email', { method: 'POST', body: JSON.stringify(data) }); }
  async resendVerificationEmail(email: string) { return this.makeRequest(`/resend_verification_email?email=${encodeURIComponent(email)}`); }
  async sendForgotPasswordEmail(email: string) { return this.makeRequest(`/forgot_password_email?email=${encodeURIComponent(email)}`); }
  async resetPassword(data: ResetPasswordData) { return this.makeRequest('/reset_password', { method: 'POST', body: JSON.stringify(data) }); }
  async getOAuthUrl() { return this.makeRequest('/auth'); }
  async handleOAuthCallback(data: OAuthCallbackData) { return this.makeRequest('/auth_callback', { method: 'POST', body: JSON.stringify(data) }); }

  // PROJECTS & STATS
  
  // In your ApiService class
async getProjects(params?: PaginationParams): Promise<ApiResponse<ProjectListingResponse>> {
  return this.makeRequest<ProjectListingResponse>(`/proj_listing`);
}
  async createProject(data: CreateProjectData) { return this.makeRequest('/create_project', { method: 'POST', body: JSON.stringify(data) }); }
  async deleteProject(data: { proj_id: number }) { return this.makeRequest('/delete_project', { method: 'POST', body: JSON.stringify(data) }); }
  async getOverallStats() { return this.makeRequest<OverallStats>('/overall_stats'); }
  async getProjectStats(projId: string) { return this.makeRequest<ProjectStats>(`/project_stats?proj_id=${projId}`); }
  
  // SETTINGS
  async getProjectSettings(projId: string) { return this.makeRequest<ProjectSettings>(`/project_setting?proj_id=${projId}`); }

  // MENTIONS
  async getPendingMentions(params: MentionParams) { return this.makeRequest<MentionsResponse>(`/pending_mentions?${new URLSearchParams(params as any)}`); }
  async getPinnedMentions(params: MentionParams) { return this.makeRequest<MentionsResponse>(`/pinned_mentions?${new URLSearchParams(params as any)}`); }
  async getActedMentions(params: MentionParams) { return this.makeRequest<MentionsResponse>(`/acted_mentions?${new URLSearchParams(params as any)}`); }
  async actOnMention(data: ActOnMentionData) { return this.makeRequest('/act_on_mention', { method: 'POST', body: JSON.stringify(data) }); }
  async generateComment(data: GenerateCommentData) { return this.makeRequest<{ comment: string }>('/generat_comment', { method: 'POST', body: JSON.stringify(data) }); }
// Add this function inside your ApiService class in api.ts

async generateExplain(url: string): Promise<ApiResponse<any>> {
  const endpoint = `/proj_exp_gen?url=${encodeURIComponent(url)}`;
  return this.makeRequest(endpoint);
}
  // KNOWLEDGE BASE
  async getKnowledgeBase() { return this.makeRequest<KnowledgeBaseEntry[]>('/list_knowledge_base'); }
  async addKnowledgeBase(data: AddKnowledgeBaseData) { return this.makeRequest('/add_knowledge_base', { method: 'POST', body: JSON.stringify(data) }); }
  async updateKnowledgeBase(data: UpdateKnowledgeBaseData) { return this.makeRequest('/update_knowledge_base', { method: 'POST', body: JSON.stringify({ kb_id: data.kb_id, title: data.title, personal_info: data.content }) }); }
  async deleteKnowledgeBase(data: DeleteKnowledgeBaseData) { return this.makeRequest('/del_knowledge_base', { method: 'POST', body: JSON.stringify(data) }); }
  async getFounderTemplates() { return this.makeRequest<FounderTemplate[]>('/founder_template'); }

  // SUBREDDITS & KEYWORDS
  async listSubreddits(proj_id: string) { return this.makeRequest<SubredditInfo[]>(`/list_subreddits?proj_id=${proj_id}`); }
  async searchSubreddits(search: string) { return this.makeRequest<SubredditInfo[]>(`/search_subreddits?search=${search}`); }
  async addSubreddits(data: AddSubredditsData) { return this.makeRequest('/add_subreddits', { method: 'POST', body: JSON.stringify(data) }); }
  async deleteSubreddits(data: DeleteSubredditsData) { return this.makeRequest('/del_subreddits', { method: 'POST', body: JSON.stringify(data) }); }
  async getKeywords(projId: string) { return this.makeRequest<{keyword: string[]}>(`/list_keywords?proj_id=${projId}`); }
  async addKeywords(data: AddKeywordsData) { return this.makeRequest('/add_keywords', { method: 'POST', body: JSON.stringify(data) }); }
  async deleteKeywords(data: DeleteKeywordsData) { return this.makeRequest('/del_keywords', { method: 'POST', body: JSON.stringify({ proj_id: data.proj_id, keywords: data.del_keywords }) }); }

  // ACCOUNT & BILLING
  async getAccountDetails() { return this.makeRequest<AccountDetails>('/account'); }
  async getAvailablePlans() { return this.makeRequest<SubscriptionPlan[]>('/available_plans'); }
  async getPaymentUrl(planId: number) { return this.makeRequest<{url:string}>(`/pay_url?plan_id=${planId}`); }
  
    async invalidateAllMentionCaches(projId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/invalidate_mention_cache?proj_id=${projId}`, {
      method: 'POST',
    });
  }

  // FEEDBACK
  async submitFeedback(payload: { content: string; type: string }) { return this.makeRequest('/feed_back', { method: 'POST', body: JSON.stringify({ feed_back: payload.content, type: payload.type }) }); }
}

export const apiService = new ApiService();
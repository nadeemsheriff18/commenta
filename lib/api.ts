import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- INTERFACES ---

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
export interface ResetPasswordData {
    token: string;
    new_password: string;
}
export interface User {
  user_id: string;
  name: string;
  email: string;
  picture?: string; 
}


// Payment & Account Interfaces
interface SubscriptionPlan {
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

interface PaymentUrlResponse {
  url: string;
}

interface AccountDetails {
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
// Add this with your other interface definitions
interface UpdateKnowledgeBaseData {
  kb_id: number;
  title: string;
  content: string;
}
// OAuth Interfaces
interface OAuthUrlResponse {
  url: string;
}

interface OAuthCallbackData {
  code: string;
  timezone: string;
}

interface OAuthCallbackResponse {
  user_id: string;
  email: string;
  name: string;
  picture: string;
  exp: string;
  token: string;
}

interface Project {
  id: string;
  name: string;
  link: string;
  // person_name:string;
  // audiance: string;
  // problem: string;
  // solution: string;
  // person_story: string;
  total_subreddits: number;
  total_mentions: number;
  created_at: string;
}

// Find this interface in api.ts

// Replace it with this corrected version

interface CreateProjectData {
  name: string;
  product_link: string;
  audience: string; // <-- Corrected spelling
  problem: string;
  solution: string;
}

interface ProjectSettings {
  name: string;
  solution: string;
  prod_url: string;
  audience: string;
  problem: string;
  // pers_story: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Mention Management Interfaces
// In src/lib/api.ts

interface Mention {
  id: number;
  subreddit: string;
  title: string;
  text: string;
  score: number;
  comment_cnt: number;
  time: string;
  link: string;
  prio?:"low" | "medium" | "high";
  similarity: number;
  comment?: any;
  is_new?: boolean; // <-- ADD THIS LINE
}

interface MentionsResponse {
  exp: string;
  ments: Mention[];
  total: number; // <-- Add this line
}
interface MentionParams {
  proj_id: string;
  hours?: number;
  ment_type?: 'completed' | 'ignored' | 'noise';
  page?: number;
  limit?: number;
}

interface ActOnMentionData {
  ment_id: number;
  type: 'completed' | 'ignored' | 'pinned' | 'noise' | 'active';
  comment?: string;
}

interface GenerateCommentData {
  ment_id: number;
  is_relvent: boolean;
}

// Knowledge Base Interfaces
interface KnowledgeBaseEntry {
  id: number;
  title?: string;
  content: string;
  created_on: string;
}

interface AddKnowledgeBaseData {
  personal_info: Record<string, any>;
}

interface DeleteKnowledgeBaseData {
  kb_id: number;
}
interface FounderTemplate {
  id: number;
  photo: string;
  name: string;
  company: string;
  description: string;
  profileText: string;
}
// Subreddits & Keywords Interfaces
// Find this interface in your api.ts file
interface SubredditInfo {
  name: string;
  title: string;
  description: string;
  subscribers: number;
  over18: boolean;
  quarantine: boolean;
  subreddit_type: string;
  url: string;
  created_utc: number;
  isSystemAdded?: boolean; // <-- ADD THIS LINE
}

interface AddSubredditsData {
  proj_id: string;
  subreddits: string[];
}

interface DeleteSubredditsData {
  proj_id: string;
  subreddits: string[];
}

interface KeywordsResponse {
  keywords: string[];
}

interface AddKeywordsData {
  proj_id: string;
  keywords: string[];
}

interface DeleteKeywordsData {
  proj_id: string;
  del_keywords: string[];
}
interface ProjectStats {
  total_mentions: number;
  total_subreddits: number;
  completed_mentions: number;
  avg_relevance: number;
}


// Add this function inside your ApiService class in api.ts


// Cache Management
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private mentionsCache = new Map<string, { data: any; exp: string }>();
  private projectsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private keywordsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private subredditsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private projectSettingsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes: number = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }
  setProjectSettings(key: string, data: any, ttlMinutes: number = 30) {
    this.projectSettingsCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }
  getProjectSettings(key: string) {
    const cached = this.projectSettingsCache.get(key);
    if (!cached) return null;
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.projectSettingsCache.delete(key);
      return null;
    }
    return cached.data;
  }
  setProjects(key: string, data: any, ttlMinutes: number = 30) {
    this.projectsCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  getProjects(key: string) {
    const cached = this.projectsCache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.projectsCache.delete(key);
      return null;
    }

    return cached.data;
  }

  setKeywords(key: string, data: any, ttlMinutes: number = 15) {
    this.keywordsCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  getKeywords(key: string) {
    const cached = this.keywordsCache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.keywordsCache.delete(key);
      return null;
    }

    return cached.data;
  }

  setSubreddits(key: string, data: any, ttlMinutes: number = 15) {
    this.subredditsCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  getSubreddits(key: string) {
    const cached = this.subredditsCache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.subredditsCache.delete(key);
      return null;
    }

    return cached.data;
  }

  setMentions(key: string, data: any, exp: string) {
    this.mentionsCache.set(key, {
      data,
      exp
    });
  }

  getMentions(key: string) {
    const cached = this.mentionsCache.get(key);
    if (!cached) return null;

    // Check if expired
    const expTime = new Date(cached.exp).getTime();
    const now = Date.now();

    if (now >= expTime) {
      this.mentionsCache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(pattern: string) {
    // Invalidate all cache types
    for (const key of Array.from(this.mentionsCache.keys())) {
      if (key.includes(pattern)) {
        this.mentionsCache.delete(key);
      }
    }
    for (const key of Array.from(this.projectsCache.keys())) {
      if (key.includes(pattern)) {
        this.projectsCache.delete(key);
      }
    }
    for (const key of Array.from(this.keywordsCache.keys())) {
      if (key.includes(pattern)) {
        this.keywordsCache.delete(key);
      }
    }
    for (const key of Array.from(this.subredditsCache.keys())) {
      if (key.includes(pattern)) {
        this.subredditsCache.delete(key);
      }
    }
  }
  invalidateAllMentions(projectId: string) {

    // Invalidate all mention caches for a specific project

    for (const key of Array.from(this.mentionsCache.keys())) {

      if (key.includes(`proj_id=${projectId}`)) {

        this.mentionsCache.delete(key);

      }

    }

  }


  clear() {
    this.mentionsCache.clear();
    this.projectsCache.clear();
    this.keywordsCache.clear();
    this.subredditsCache.clear();
    this.cache.clear();
  }
}

const cacheManager = new CacheManager();

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token = Cookies.get('auth_token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || data.detail || 'Request failed',
          message: data.message || data.error || data.detail || 'Request failed'
        };
      }

      const result = {
        success: true,
        data: data,
        message: data.message,
        pagination: data.pagination
      };

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        message: 'Network error. Please check your connection.'
      };
    }
  }
  async getProjectStats(projId: string): Promise<ApiResponse<ProjectStats>> {
  return this.makeRequest<ProjectStats>(`/project_stats?proj_id=${projId}`);
}
  // Add this function inside your ApiService class
 async updateKnowledgeBase(data: UpdateKnowledgeBaseData): Promise<ApiResponse> {
  // Map frontend field names to backend field names
  const payload = {
    kb_id: data.kb_id,
    title: data.title,
    personal_info: data.content, // 'content' becomes 'personal_info' for the backend
  };
  return this.makeRequest('/update_knowledge_base', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

  // Project Management APIs
  async getProjects(params?: PaginationParams): Promise<any> {
    // Check cache first
    const cacheKey = `projects_${JSON.stringify(params || {})}`;
    const cached = cacheManager.getProjects(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached.data,
        pagination: cached.pagination
      };
    }

    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/proj_listing?${queryString}` : '/proj_listing';
    console.log("ENDPOINT ::: ", endpoint);
    const response = await this.makeRequest<Project[]>(endpoint);

    // Cache successful responses
    if (response.success && response.data) {
      cacheManager.setProjects(cacheKey, {
        data: response.data,
        pagination: response.pagination
      });

    }
    console.log("res get proj", response);
    return response;
  }
  async getProjectSettings(projId: string): Promise<ApiResponse<any>> {
    // Check cache first
    console.log("Fetching project settings for projId:", projId);
    const cacheKey = `project_settings_${projId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.log("Found cached project settings:", cached);
      return {
        success: true,
        data: cached
      };
    }

    // Fetch from API if not cached
    const response = await this.makeRequest<ProjectSettings>(`/project_setting?proj_id=${projId}`);
    console.log("Fetched project settings response:", response);

    // Cache successful responses for 15 minutes
    if (response.success && response.data) {
      cacheManager.set(cacheKey, response.data, 15);
      console.log("Cached project settings for 15 minutes");
    }

    return response;
  }
  // async getProjectSettings(projId: string): Promise<any> {
  // 	// Check cache first
  // 	console.log("Fetching project settings for projId:", projId);

  // 	// Fetch from API if not cached
  // 	const response = await this.makeRequest<ProjectSettings>(`/project_setting?proj_id=${projId}`);
  // 	console.log("Fetched project settings response:", response);
  // 	// Cache successful responses
async resendVerificationEmail(email: string): Promise<ApiResponse> {
  return this.makeRequest(`/resend_verification_email?email=${encodeURIComponent(email)}`);
}

async sendForgotPasswordEmail(email: string): Promise<ApiResponse> {
  return this.makeRequest(`/forgot_password_email?email=${encodeURIComponent(email)}`);
}

async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
  return this.makeRequest('/reset_password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


  // 	return response;
  // 	// return this.makeRequest<ProjectSettings>(`/project_setting?proj_id=${projId}`);
  // }
  async createProject(projectData: any): Promise<ApiResponse> {
    // console.log("Create proj " , JSON.stringify(projectData));
    const response = await this.makeRequest('/create_project', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });

    // Invalidate projects cache when new project is created
    if (response.success) {
      cacheManager.invalidate('projects_');
    }

    return response;
  }



  // async updateProjectSettings(projId: string, settings: ProjectSettings): Promise<ApiResponse> {
  // 	return this.makeRequest(`/project_setting?proj_id=${projId}`, {
  // 		method: 'PUT',
  // 		body: JSON.stringify(settings),
  // 	});
  // }

  async deleteProject(data: { proj_id: number }): Promise<ApiResponse> {
  const response = await this.makeRequest(`/delete_project`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Invalidate projects cache when project is deleted
  if (response.success) {
    cacheManager.invalidate('projects_');
    // Note: The proj_id is now inside the data object
    cacheManager.invalidate(`keywords_${data.proj_id}`);
    cacheManager.invalidate(`subreddits_${data.proj_id}`);
  }

  return response;
}

  // Mention Management APIs
  // Inside the ApiService class in src/lib/api.ts

// Replace the three mention-fetching functions in your ApiService class

async getPendingMentions(params: MentionParams): Promise<ApiResponse<Mention[]>> {
  const queryParams = new URLSearchParams();
  queryParams.append("proj_id", params.proj_id);
  if (params.hours) queryParams.append("hours", params.hours.toString());
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await this.makeRequest<MentionsResponse>(`/pending_mentions?${queryParams.toString()}`);

  return {
    success: response.success,
    // --- FIXED: Changed .ment to .ments ---
    data: response.data ? response.data.ments : [],
    pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / (params.limit || 10)),
        hasNext: false,
        hasPrev: false,
    },
    message: response.message,
    error: response.error,
  };
}

async getPinnedMentions(params: MentionParams): Promise<ApiResponse<Mention[]>> {
  const queryParams = new URLSearchParams();
  queryParams.append("proj_id", params.proj_id);
  if (params.hours) queryParams.append("hours", params.hours.toString());
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await this.makeRequest<MentionsResponse>(`/pinned_mentions?${queryParams.toString()}`);

  return {
    success: response.success,
    // --- FIXED: Changed .ment to .ments ---
    data: response.data ? response.data.ments : [],
    pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / (params.limit || 10)),
        hasNext: false,
        hasPrev: false,
    },
    message: response.message,
    error: response.error,
  };
}

async getActedMentions(params: MentionParams): Promise<ApiResponse<Mention[]>> {
  const queryParams = new URLSearchParams();
  queryParams.append("proj_id", params.proj_id);
  if (params.hours) queryParams.append("hours", params.hours.toString());
  if (params.ment_type) queryParams.append("ment_type", params.ment_type);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await this.makeRequest<MentionsResponse>(`/acted_mentions?${queryParams.toString()}`);

  return {
    success: response.success,
    // --- FIXED: Changed .ment to .ments ---
    data: response.data ? response.data.ments : [],
     pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / (params.limit || 10)),
        hasNext: false,
        hasPrev: false,
    },
    message: response.message,
    error: response.error,
  };
}






  async actOnMention(data: ActOnMentionData): Promise<ApiResponse> {

    const response = await this.makeRequest('/act_on_mention', {

      method: 'POST',

      body: JSON.stringify(data),

    });



    // Clear mention caches when action is performed

    if (response.success) {

      // Extract project ID from the mention data if available

      // Since we don't have project ID in the response, we'll invalidate all mention caches

      cacheManager.invalidateAllMentions('');

    }



    return response;

  }

  async generateComment(data: GenerateCommentData): Promise<any> {
    return this.makeRequest<{ comment: string }>('/generat_comment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // async generateExplain(data: any): Promise<any> {
  // 	return this.makeRequest<{ comment: string }>('/proj_exp_gen', {
  // 		method: 'GET',
  // 		body: JSON.stringify(data),
  // 	});
  // }

  async generateExplain(params: any): Promise<any> {
    // Check cache first
    console.log("EXP ----", params);

    const queryParams = new URLSearchParams();

    // if (params?.page) queryParams.append('page', params.page.toString());
    // if (params?.limit) queryParams.append('limit', params.limit.toString());
    // if (params?.search) queryParams.append('search', params.search);
    // if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    // if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    // queryParams.append(params.product_link);
    queryParams.append('url', params)
    console.log("ASDASDSADASDASD", params);
    const queryString = queryParams.toString();
    const endpoint = `/proj_exp_gen?${queryString}`

    const response = await this.makeRequest<Project[]>(endpoint);

    // Cache successful responses
    // if (response.success && response.data) {
    // 	cacheManager.setProjects(cacheKey, {
    // 		data: response.data,
    // 		pagination: response.pagination
    // 	});

    // }

    return response;
  }

  // Knowledge Base APIs
  async getKnowledgeBase(params?: PaginationParams): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/list_knowledge_base?${queryString}` : '/list_knowledge_base';

    return this.makeRequest<KnowledgeBaseEntry[]>(endpoint);
  }

  async listSubreddits(proj_id: string, params?: PaginationParams): Promise<ApiResponse<SubredditInfo[]>> {
  const queryParams = new URLSearchParams();
  
  // --- FIXED: Removed the colon from 'proj_id:' ---
  queryParams.append('proj_id', proj_id.toString());
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/list_subreddits?${queryString}`;
  
  return this.makeRequest<SubredditInfo[]>(endpoint);
}


  async addKnowledgeBase(data: AddKnowledgeBaseData): Promise<ApiResponse> {
    return this.makeRequest('/add_knowledge_base', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeBase(data: DeleteKnowledgeBaseData): Promise<ApiResponse> {
    return this.makeRequest('/del_knowledge_base', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Subreddits & Keywords APIs
  async searchSubreddits(
  search: string,
  params?: PaginationParams
): Promise<ApiResponse<SubredditInfo[]>> {
  const queryParams = new URLSearchParams();
  console.log("subreddit -----------");
  queryParams.append('search', search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return this.makeRequest<SubredditInfo[]>(`/search_subreddits?${queryParams.toString()}`);
}




  async addSubreddits(data: AddSubredditsData): Promise<ApiResponse> {
    console.log("Addingg subreddits data:", data);
    return this.makeRequest('/add_subreddits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSubreddits(data: DeleteSubredditsData): Promise<ApiResponse> {
    return this.makeRequest('/del_subreddits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getKeywords(projId: string): Promise<any> {
    // Check cache first
    const cacheKey = `keywords_${projId}`;
    const cached = cacheManager.getKeywords(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached
      };
    }

    const response = await this.makeRequest<KeywordsResponse>(`/list_keywords?proj_id=${projId}`);

    // Cache successful responses
    if (response.success && response.data) {
      cacheManager.setKeywords(cacheKey, response.data);
    }

    return response;
  }

  async addKeywords(data: AddKeywordsData): Promise<ApiResponse> {
    const response = await this.makeRequest('/add_keywords', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Invalidate keywords cache when keywords are added
    if (response.success) {
      cacheManager.invalidate(`keywords_${data.proj_id}`);
    }

    return response;
  }

  // Find and replace your existing deleteKeywords function with this one

async deleteKeywords(data: DeleteKeywordsData): Promise<ApiResponse> {
  // --- MODIFIED: Renamed 'del_keywords' to 'keywords' to match the backend ---
  const payload = {
    proj_id: data.proj_id,
    keywords: data.del_keywords, 
  };
  
  return this.makeRequest('/del_keywords', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

  // Payment & Account APIs
  async getAvailablePlans(): Promise<any> {
    return this.makeRequest<SubscriptionPlan[]>('/available_plans');
  }

  async getPaymentUrl(planId: number): Promise<any> {
    return this.makeRequest<PaymentUrlResponse>(`/pay_url?plan_id=${planId}`);
  }

  async getAccountDetails(): Promise<any> {
    return this.makeRequest<AccountDetails>('/account');
  }

  // OAuth APIs
  // async getOAuthUrl(): Promise<ApiResponse<OAuthUrlResponse>> {
  // 	return this.makeRequest<OAuthUrlResponse>('/auth');
  // }
  // 	async handleOAuthCallback(data: OAuthCallbackData): Promise<ApiResponse<OAuthCallbackResponse>> {
  // 		return this.makeRequest<OAuthCallbackResponse>('/auth_callback', {
  // 			method: 'POST',
  // 			body: JSON.stringify(data),
  // 		});
  // 		}
  async getOAuthUrl(): Promise<any> {
    return this.makeRequest<OAuthUrlResponse>('/auth');
  }
  async handleOAuthCallback(data: OAuthCallbackData): Promise<any> {
    return this.makeRequest<OAuthCallbackResponse>('/auth_callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  // Find this function in your ApiService class and change the endpoint

async getFounderTemplates(): Promise<ApiResponse<any>> {
  // Change '/founder_templates' to '/founder_template'
  return this.makeRequest<FounderTemplate[]>('/founder_template');
}

  // --- FEEDBACK API (Added) ---
 // In your ApiService class within src/lib/api.ts

async submitFeedback(payload: { content: string; type: string }): Promise<ApiResponse<any>> {
  // Create a payload that matches the backend's expectation
  const backendPayload = {
    feed_back: payload.content,
    type: payload.type,
  };
  
  // Use the correct endpoint path: /feed_back
  return this.makeRequest('/feed_back', {
    method: 'POST',
    body: JSON.stringify(backendPayload),
  });
}
  // --- END FEEDBACK API ---

  // Cache management methods
  clearCache() {
    cacheManager.clear();
  }

  invalidateCache(pattern: string) {
    cacheManager.invalidate(pattern);
  }
  invalidateAllMentionCaches(projectId: string) {

    cacheManager.invalidateAllMentions(projectId);

  }
}

export const apiService = new ApiService();
export type {
  Project,
  CreateProjectData,
  ProjectSettings,
  ApiResponse,
  PaginationParams,
  Mention,
  FounderTemplate,
  MentionsResponse,
  MentionParams,
  ActOnMentionData,
  GenerateCommentData,
  KnowledgeBaseEntry,
  AddKnowledgeBaseData,
  UpdateKnowledgeBaseData,
  DeleteKnowledgeBaseData,
  SubredditInfo,
  AddSubredditsData,
  DeleteSubredditsData,
  KeywordsResponse,
  AddKeywordsData,
  DeleteKeywordsData,
  SubscriptionPlan,
  PaymentUrlResponse,
  AccountDetails,
  ProjectStats, // <-- Add this
  
  OAuthUrlResponse,
  OAuthCallbackData,
  OAuthCallbackResponse
};
import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
  product_link: string;
  product_explanation: string;
  person_name: string;
  person_role: string;
  person_story: string;
  total_subreddits: number;
  total_mentions: number;
  created_at: string;
}

interface CreateProjectData {
  name: string;
  product_link: string;
  product_explanation: string;
  person_name: string;
  person_role: string;
  person_story: string;
}

interface ProjectSettings {
  name: string;
  prod_exp: string;
  prod_url: string;
  pers_name: string;
  pers_role: string;
  pers_story: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Mention Management Interfaces
interface Mention {
  id: number;
  subreddit: string;
  title: string;
  text: string;
  score: number;
  comment_cnt: number;
  time: string;
  link: string;
  prio?: number;
  similarity: number;
  comment?: string;
}

interface MentionsResponse {
  exp: string;
  ment: Mention[];
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

// Subreddits & Keywords Interfaces
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

// Cache Management
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private mentionsCache = new Map<string, { data: any; exp: string }>();
  
  set(key: string, data: any, ttlMinutes: number = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
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
  
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  invalidate(pattern: string) {
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
    for (const key of Array.from(this.mentionsCache.keys())) {
      if (key.includes(pattern)) {
        this.mentionsCache.delete(key);
      }
    }
  }
  
  clear() {
    this.cache.clear();
    this.mentionsCache.clear();
  }
}

const cacheManager = new CacheManager();

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false,
    cacheTTL: number = 5
  ): Promise<ApiResponse<T>> {
    console.log('🚀 API Request:', {
      endpoint,
      method: options.method || 'GET',
      useCache,
      cacheTTL
    });

    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        console.log('📦 Cache hit for:', endpoint, cached);
        return cached;
      }
    }

    const token = authService.getToken();
    console.log('🔑 Auth token:', token ? 'Present' : 'Missing');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    console.log('📡 Full request config:', {
      url: `${API_BASE_URL}${endpoint}`,
      config
    });
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      console.log('📥 Raw response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('📄 Response data:', data);

      if (!response.ok) {
        console.error('❌ Request failed:', {
          status: response.status,
          data
        });
        return {
          success: false,
          error: data.message || data.error || data.detail || 'Request failed',
          message: data.message || data.error || data.detail || 'Request failed'
        };
      }

      const result = {
        success: true,
        data: data,
         pagination: data.pagination,
        message: data.message
      };

      console.log('✅ Successful response:', result);
      // Cache successful GET requests
      if (useCache && (!options.method || options.method === 'GET')) {
        console.log('💾 Caching response for:', cacheKey);
        cacheManager.set(cacheKey, result, cacheTTL);
      }

      return result;
    } catch (error) {
      console.error('🔥 Network error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        message: 'Network error. Please check your connection.'
      };
    }
  }

  // Project Management APIs
  async getProjects(params?: PaginationParams): Promise<any> {
    // console.log('📋 getProjects called with params:', params);
    
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/proj_listing?${queryString}` : '/proj_listing';
    
    // console.log('🔗 Final endpoint:', endpoint);
    // console.log('🔍 Query string:', queryString);
    
    const result = await this.makeRequest<Project[]>(endpoint, {}, true, 2);
    // console.log('📊 getProjects result:', result);
    return result;
  }

  async createProject(projectData: CreateProjectData): Promise<ApiResponse> {
    const result = await this.makeRequest('/create_project', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    
    if (result.success) {
      cacheManager.invalidate('proj_listing');
    }
    
    return result;
  }

  async getProjectSettings(projId: string): Promise<ApiResponse<ProjectSettings>> {
    return this.makeRequest<ProjectSettings>(`/project_setting?proj_id=${projId}`, {}, true, 10);
  }

  async updateProjectSettings(projId: string, settings: ProjectSettings): Promise<ApiResponse> {
    const result = await this.makeRequest(`/project_setting?proj_id=${projId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    
    if (result.success) {
      cacheManager.invalidate(`project_setting?proj_id=${projId}`);
      cacheManager.invalidate('proj_listing');
    }
    
    return result;
  }

  async deleteProject(projId: string): Promise<ApiResponse> {
    const result = await this.makeRequest(`/delete_project?proj_id=${projId}`, {
      method: 'POST',
    });
    
    if (result.success) {
      cacheManager.invalidate('proj_listing');
      cacheManager.invalidate(`project_setting?proj_id=${projId}`);
    }
    
    return result;
  }

  // Mention Management APIs
  async getPendingMentions(params: MentionParams): Promise<ApiResponse<Mention[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('proj_id', params.proj_id);
    if (params.hours) queryParams.append('hours', params.hours.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const cacheKey = `pending_mentions_${queryParams.toString()}`;
    
    // Check mentions cache first
    const cached = cacheManager.getMentions(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached.ment,
        pagination: cached.pagination
      };
    }
    
    const response = await this.makeRequest<MentionsResponse>(`/pending_mentions?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      // Cache with expiration
      cacheManager.setMentions(cacheKey, response.data, response.data.exp);
      
      return {
        success: true,
        data: response.data.ment,
        pagination: response.pagination
      };
    }
    
    return {
      success: response.success,
      data: response.data?.ment,
      message: response.message,
      error: response.error,
      pagination: response.pagination
    };
  }

  async getActedMentions(params: MentionParams): Promise<ApiResponse<Mention[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('proj_id', params.proj_id);
    if (params.hours) queryParams.append('hours', params.hours.toString());
    if (params.ment_type) queryParams.append('ment_type', params.ment_type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const cacheKey = `acted_mentions_${queryParams.toString()}`;
    
    // Check mentions cache first
    const cached = cacheManager.getMentions(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached.ment,
        pagination: cached.pagination
      };
    }
    
    const response = await this.makeRequest<MentionsResponse>(`/acted_mentions?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      // Cache with expiration
      cacheManager.setMentions(cacheKey, response.data, response.data.exp);
      
      return {
        success: true,
        data: response.data.ment,
        pagination: response.pagination
      };
    }
    
    return {
      success: response.success,
      data: response.data?.ment,
      message: response.message,
      error: response.error,
      pagination: response.pagination
    };
  }

  async getPinnedMentions(params: MentionParams): Promise<ApiResponse<Mention[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('proj_id', params.proj_id);
    if (params.hours) queryParams.append('hours', params.hours.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const cacheKey = `pinned_mentions_${queryParams.toString()}`;
    
    // Check mentions cache first
    const cached = cacheManager.getMentions(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached.ment,
        pagination: cached.pagination
      };
    }
    
    const response = await this.makeRequest<MentionsResponse>(`/pinned_mentions?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      // Cache with expiration
      cacheManager.setMentions(cacheKey, response.data, response.data.exp);
      
      return {
        success: true,
        data: response.data.ment,
        pagination: response.pagination
      };
    }
    
    return {
      success: response.success,
      data: response.data?.ment,
      message: response.message,
      error: response.error,
      pagination: response.pagination
    };
  }

  async actOnMention(data: ActOnMentionData): Promise<ApiResponse> {
    const result = await this.makeRequest('/act_on_mention', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success) {
      // Invalidate mention caches
      cacheManager.invalidate('mentions');
    }
    
    return result;
  }

  async generateComment(data: GenerateCommentData): Promise<ApiResponse<{ comment: string }>> {
    return this.makeRequest<{ comment: string }>('/generat_comment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Knowledge Base APIs
  async getKnowledgeBase(params?: PaginationParams): Promise<ApiResponse<KnowledgeBaseEntry[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/list_knowledge_base?${queryString}` : '/list_knowledge_base';
    
    return this.makeRequest<KnowledgeBaseEntry[]>(endpoint, {}, true, 5);
  }

  async addKnowledgeBase(data: AddKnowledgeBaseData): Promise<ApiResponse> {
    const result = await this.makeRequest('/add_knowledge_base', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success) {
      cacheManager.invalidate('list_knowledge_base');
    }
    
    return result;
  }

  async deleteKnowledgeBase(data: DeleteKnowledgeBaseData): Promise<ApiResponse> {
    const result = await this.makeRequest('/del_knowledge_base', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success) {
      cacheManager.invalidate('list_knowledge_base');
    }
    
    return result;
  }

  // Subreddits & Keywords APIs
  async searchSubreddits(search: string, params?: PaginationParams): Promise<ApiResponse<SubredditInfo[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('search', search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.makeRequest<SubredditInfo[]>(`/search_subreddits?${queryParams.toString()}`, {}, true, 10);
  }

  async addSubreddits(data: AddSubredditsData): Promise<ApiResponse> {
    const result = await this.makeRequest('/add_subreddits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success) {
      cacheManager.invalidate('proj_listing');
      cacheManager.invalidate('search_subreddits');
    }
    
    return result;
  }

  async deleteSubreddits(data: DeleteSubredditsData): Promise<ApiResponse> {
    const result = await this.makeRequest('/del_subreddits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success) {
      cacheManager.invalidate('proj_listing');
      cacheManager.invalidate('search_subreddits');
    }
    
    return result;
  }

  async getKeywords(projId: string): Promise<ApiResponse<KeywordsResponse>> {
    return this.makeRequest<KeywordsResponse>(`/list_keywords?proj_id=${projId}`, {}, true, 5);
  }

  async addKeywords(data: AddKeywordsData): Promise<ApiResponse> {
    const result = await this.makeRequest('/add_keywords', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success) {
      cacheManager.invalidate(`list_keywords?proj_id=${data.proj_id}`);
    }
    
    return result;
  }

  async deleteKeywords(data: DeleteKeywordsData): Promise<ApiResponse> {
    const result = await this.makeRequest('/del_keywords', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success) {
      cacheManager.invalidate(`list_keywords?proj_id=${data.proj_id}`);
    }
    
    return result;
  }

  // Payment & Account APIs
  async getAvailablePlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return this.makeRequest<SubscriptionPlan[]>('/available_plans', {}, true, 30); // Cache for 30 minutes
  }

  async getPaymentUrl(planId: number): Promise<ApiResponse<PaymentUrlResponse>> {
    return this.makeRequest<PaymentUrlResponse>(`/pay_url?plan_id=${planId}`);
  }

  async getAccountDetails(): Promise<ApiResponse<AccountDetails>> {
    return this.makeRequest<AccountDetails>('/account', {}, true, 5); // Cache for 5 minutes
  }

  // OAuth APIs
  async getOAuthUrl(): Promise<ApiResponse<OAuthUrlResponse>> {
    return this.makeRequest<OAuthUrlResponse>('/auth', {}, false);
  }

  async handleOAuthCallback(data: OAuthCallbackData): Promise<ApiResponse<OAuthCallbackResponse>> {
    return this.makeRequest<OAuthCallbackResponse>('/auth_callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cache management methods
  clearCache() {
    cacheManager.clear();
  }

  invalidateCache(pattern: string) {
    cacheManager.invalidate(pattern);
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
  MentionsResponse,
  MentionParams,
  ActOnMentionData,
  GenerateCommentData,
  KnowledgeBaseEntry,
  AddKnowledgeBaseData,
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
  OAuthUrlResponse,
  OAuthCallbackData,
  OAuthCallbackResponse
};
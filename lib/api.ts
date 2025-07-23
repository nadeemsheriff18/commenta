import { authService } from './auth';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
// || 'http://192.168.43.144:8000 '|| 'http://localhost:4000' || 'https://fa5e7e8562a4.ngrok-free.app/summa'
// ;


const API_BASE_URL = 'http://192.168.43.144:8000';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
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

interface CreateProjectData {
  name: string;
  product_link: string;
  audiance: string;
  problem: string;
  solution: string;
  // person_story: string;
}

interface ProjectSettings {
  name: string;
  solution: string;
  prod_url: string;
  audiance: string;
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
  comment?: any ;
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
interface FounderTemplate {
  id: number;
  photo: string;
  name: string;
  company: string;
  description: string;
  profileText: string;
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
    const token = authService.getToken();
    
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
    console.log("ENDPOINT ::: " , endpoint);
    const response = await this.makeRequest<Project[]>(endpoint);
    
    // Cache successful responses
    if (response.success && response.data) {
      cacheManager.setProjects(cacheKey, {
        data: response.data,
        pagination: response.pagination
      });
      
    }
    console.log("res get proj" , response);
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
  //   // Check cache first
  //   console.log("Fetching project settings for projId:", projId);

  //   // Fetch from API if not cached
  //   const response = await this.makeRequest<ProjectSettings>(`/project_setting?proj_id=${projId}`);
  //   console.log("Fetched project settings response:", response);
  //   // Cache successful responses
    



  //   return response;
  //   // return this.makeRequest<ProjectSettings>(`/project_setting?proj_id=${projId}`);
  // }
  async createProject(projectData:any): Promise<ApiResponse> {
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
  //   return this.makeRequest(`/project_setting?proj_id=${projId}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(settings),
  //   });
  // }

  async deleteProject(projId: string): Promise<ApiResponse> {
    const response = await this.makeRequest(`/delete_project?proj_id=${projId}`, {
      method: 'POST',
    });
    
    // Invalidate projects cache when project is deleted
    if (response.success) {
      cacheManager.invalidate('projects_');
      cacheManager.invalidate(`keywords_${projId}`);
      cacheManager.invalidate(`subreddits_${projId}`);
    }
    
    return response;
  }

  // Mention Management APIs
  async getPendingMentions(params: MentionParams): Promise<any> {
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
    
    const response = await this.makeRequest<any>(`/pending_mentions?${queryParams.toString()}`);
    console.log("Pending- Mentions response:", response);
    if (response.success && response.data) {
      // Cache with expiration
      cacheManager.setMentions(cacheKey, response.data, response.data.exp);
      
      return {
        success: true,
        data: response.data.ment,
        pagination: response.pagination
      };
    }
    console.log("PENDDYYYYYYYYYYYYY :" , {
      success: response.success,
      data: response.data ? response.data.ment : undefined,
      message: response.message,
      error: response.error,
      pagination: response.pagination
    })
    return {
      success: response.success,
      data: response.data ? response.data.ment : undefined,
      message: response.message,
      error: response.error,
      pagination: response.pagination
    };
  }
  async getPinnedMentions(params: MentionParams): Promise<any> {
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
    console.log(response.data)
    if (response.success && response.data) {
      // Cache with expiration
      console.log("Pinned Mentions response:", response.data);
      cacheManager.setMentions(cacheKey, response.data, response.data.exp);
      // console.log(response.data.ment);
      return {
        success: true,
        data: response.data.ment,
        pagination: response.pagination
      };
    }
    
    return {
      success: response.success,
      data: response.data ? response.data.ment : undefined,
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
      data: response.data ? response.data.ment : undefined,
      message: response.message,
      error: response.error,
      pagination: response.pagination
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
  //   return this.makeRequest<{ comment: string }>('/proj_exp_gen', {
  //     method: 'GET',
  //     body: JSON.stringify(data),
  //   });
  // }

  async generateExplain(params: any): Promise<any> {
    // Check cache first
    console.log("EXP ----" , params);
    
    const queryParams = new URLSearchParams();
    
    // if (params?.page) queryParams.append('page', params.page.toString());
    // if (params?.limit) queryParams.append('limit', params.limit.toString());
    // if (params?.search) queryParams.append('search', params.search);
    // if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    // if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    // queryParams.append(params.product_link);
    queryParams.append('url' ,params )
    console.log("ASDASDSADASDASD" , params);
    const queryString = queryParams.toString();
    const endpoint = `/proj_exp_gen?${queryString}`
    
    const response = await this.makeRequest<Project[]>(endpoint);
    
    // Cache successful responses
    // if (response.success && response.data) {
    //   cacheManager.setProjects(cacheKey, {
    //     data: response.data,
    //     pagination: response.pagination
    //   });
      
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

  async listSubreddits(proj_id: string , params?: PaginationParams): Promise<ApiResponse<any>> {
    // const cacheKey = `subreddits_${proj_id}`;
    // const cached = cacheManager.getSubreddits(cacheKey);
    // if (cached) {
    //   return {
    //     success: true,
    //     data: cached
    //   };
    // }
    const queryParams = new URLSearchParams();
    console.log("subreddit -----------")
    queryParams.append('proj_id:', proj_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/list_subreddits?${queryString}` : '/list_subreddits';
    const response = await this.makeRequest<SubredditInfo[]>(endpoint);
    // if (response.success && response.data) {
    //   cacheManager.setKeywords(cacheKey, response.data);
    // }
    return response;
    // return this.makeRequest<SubredditInfo[]>(endpoint);
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
  async searchSubreddits(search: string, params?: PaginationParams): Promise<any> {
    const queryParams = new URLSearchParams();
    console.log("subreddit -----------")
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

  async deleteKeywords(data: DeleteKeywordsData): Promise<ApiResponse> {
    const response = await this.makeRequest('/del_keywords', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalidate keywords cache when keywords are deleted
    if (response.success) {
      cacheManager.invalidate(`keywords_${data.proj_id}`);
    }
    
    return response;
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
    //   return this.makeRequest<OAuthUrlResponse>('/auth');
    // }
    //  async handleOAuthCallback(data: OAuthCallbackData): Promise<ApiResponse<OAuthCallbackResponse>> {
      //   return this.makeRequest<OAuthCallbackResponse>('/auth_callback', {
        //     method: 'POST',
        //     body: JSON.stringify(data),
        //   });
        // }
        async getOAuthUrl(): Promise<any> {
          return this.makeRequest<OAuthUrlResponse>('/auth');
        }
  async handleOAuthCallback(data: OAuthCallbackData): Promise<any> {
    return this.makeRequest<OAuthCallbackResponse>('/auth_callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getFounderTemplates(): Promise<ApiResponse<any>> {
    return this.makeRequest<FounderTemplate[]>('/founder_templates'); // Cache for 30 minutes
  }
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
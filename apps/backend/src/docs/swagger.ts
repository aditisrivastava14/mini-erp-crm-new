import { API_PREFIX, LEAD_SOURCE, LEAD_STATUS } from '@gigflow/shared';
import { env } from '../config/env';

const userRoleEnum = ['ADMIN', 'SALES'];
const leadStatusEnum = Object.values(LEAD_STATUS);
const leadSourceEnum = Object.values(LEAD_SOURCE);

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '66b4b1c8f0d3f3a0c3c4f9e1' },
    name: { type: 'string', example: 'Ayesha Khan' },
    email: { type: 'string', format: 'email', example: 'ayesha@gigflow.com' },
    role: { type: 'string', enum: userRoleEnum, example: 'SALES' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'name', 'email', 'role'],
};

const leadScoreBreakdownSchema = {
  type: 'object',
  properties: {
    source: { type: 'integer', example: 20 },
    engagement: { type: 'integer', example: 35 },
    status: { type: 'integer', example: 25 },
    domain: { type: 'integer', example: 10 },
    total: { type: 'integer', example: 90 },
    priority: { type: 'string', enum: ['High', 'Medium', 'Low'], example: 'High' },
  },
  required: ['source', 'engagement', 'status', 'domain', 'total', 'priority'],
};

const leadSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '66b4b1c8f0d3f3a0c3c4f9e2' },
    name: { type: 'string', example: 'Sarah Ali' },
    email: { type: 'string', format: 'email', example: 'sarah@example.com' },
    status: { type: 'string', enum: leadStatusEnum, example: 'New' },
    source: { type: 'string', enum: leadSourceEnum, example: 'Website' },
    notes: { type: 'string', example: 'Requested demo next week' },
    assignedTo: {
      oneOf: [
        { type: 'string', example: '66b4b1c8f0d3f3a0c3c4f9e1' },
        userSchema,
      ],
      nullable: true,
    },
    activityTimeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string', example: 'Lead Created' },
          timestamp: { type: 'string', format: 'date-time' },
          performedBy: {
            oneOf: [
              { type: 'string', example: '66b4b1c8f0d3f3a0c3c4f9e1' },
              userSchema,
            ],
          },
        },
        required: ['action', 'timestamp', 'performedBy'],
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    score: { type: 'number', example: 82 },
    priority: { type: 'string', enum: ['High', 'Medium', 'Low'], example: 'High' },
    scoreBreakdown: leadScoreBreakdownSchema,
    scoreExplanation: { type: 'string', example: 'Strong engagement and a high-value company domain.' },
  },
  required: ['id', 'name', 'email', 'status', 'source', 'activityTimeline'],
};

const paginationSchema = {
  type: 'object',
  properties: {
    total: { type: 'integer', example: 100 },
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 10 },
    totalPages: { type: 'integer', example: 10 },
  },
  required: ['total', 'page', 'limit', 'totalPages'],
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'GigFlow CRM API',
    version: '1.0.0',
    description: 'OpenAPI specification for the GigFlow CRM backend.',
  },
  servers: [
    {
      url: `http://localhost:${env.port}${API_PREFIX}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service status and uptime' },
    { name: 'Auth', description: 'Authentication and session management' },
    { name: 'Leads', description: 'Lead lifecycle operations' },
    { name: 'Analytics', description: 'Aggregated dashboard data' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          data: {},
          message: { type: 'string', example: 'Success' },
          success: { type: 'boolean', example: true },
        },
        required: ['statusCode', 'data', 'message', 'success'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Invalid email or password' },
          success: { type: 'boolean', example: false },
          data: { nullable: true },
        },
      },
      User: userSchema,
      Lead: leadSchema,
      Pagination: paginationSchema,
      AuthTokenResponse: {
        type: 'object',
        properties: {
          user: userSchema,
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
        required: ['user', 'accessToken'],
      },
      LeadListResponse: {
        type: 'object',
        properties: {
          leads: { type: 'array', items: leadSchema },
          pagination: paginationSchema,
        },
      },
      AnalyticsOverview: {
        type: 'object',
        properties: {
          stats: {
            type: 'object',
            properties: {
              totalLeads: { type: 'integer', example: 42 },
              qualifiedLeads: { type: 'integer', example: 18 },
              lostLeads: { type: 'integer', example: 6 },
              conversionRate: { type: 'integer', example: 43 },
            },
          },
          charts: {
            type: 'object',
            properties: {
              leadsBySource: {
                type: 'array',
                items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'integer' } } },
              },
              leadsByStatus: {
                type: 'array',
                items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'integer' } } },
              },
              monthlyGrowth: {
                type: 'array',
                items: { type: 'object', properties: { month: { type: 'string' }, value: { type: 'integer' } } },
              },
            },
          },
          leadQuality: {
            type: 'object',
            properties: {
              averageScore: { type: 'integer', example: 68 },
              highPriority: { type: 'integer', example: 10 },
              mediumPriority: { type: 'integer', example: 20 },
              lowPriority: { type: 'integer', example: 12 },
              distribution: {
                type: 'array',
                items: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'integer' } } },
              },
              topLeads: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    score: { type: 'integer' },
                    priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
                  },
                },
              },
            },
          },
          recentActivities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                leadId: { type: 'string' },
                leadName: { type: 'string' },
                action: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                performedBy: {
                  oneOf: [
                    { type: 'string' },
                    userSchema,
                  ],
                },
              },
            },
          },
        },
        required: ['stats', 'charts', 'leadQuality', 'recentActivities'],
      },
      HealthData: {
        type: 'object',
        properties: {
          service: { type: 'string', example: 'GigFlow Backend' },
          status: { type: 'string', example: 'ok' },
          database: { type: 'string', example: 'connected' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number', example: 3600.5 },
        },
        required: ['service', 'status', 'database', 'timestamp', 'uptime'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Ayesha Khan' },
          email: { type: 'string', format: 'email', example: 'ayesha@gigflow.com' },
          password: { type: 'string', format: 'password', example: 'Admin@123' },
          role: { type: 'string', enum: ['ADMIN', 'SALES_USER'], default: 'SALES_USER' },
        },
        required: ['name', 'email', 'password'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'ayesha@gigflow.com' },
          password: { type: 'string', format: 'password', example: 'Admin@123' },
        },
        required: ['email', 'password'],
      },
      CreateLeadRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Sarah Ali' },
          email: { type: 'string', format: 'email', example: 'sarah@example.com' },
          status: { type: 'string', enum: leadStatusEnum, default: LEAD_STATUS.NEW },
          source: { type: 'string', enum: leadSourceEnum, example: 'Website' },
          notes: { type: 'string', example: 'Requested pricing call' },
          assignedTo: { type: 'string', example: '66b4b1c8f0d3f3a0c3c4f9e1' },
        },
        required: ['name', 'email', 'source'],
      },
      UpdateLeadRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Sarah Ali' },
          email: { type: 'string', format: 'email', example: 'sarah@example.com' },
          status: { type: 'string', enum: leadStatusEnum },
          source: { type: 'string', enum: leadSourceEnum },
          notes: { type: 'string', example: 'Follow-up scheduled' },
          assignedTo: { type: 'string', example: '66b4b1c8f0d3f3a0c3c4f9e1' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Get service health',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: { data: { $ref: '#/components/schemas/HealthData' } },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/AuthTokenResponse' } } },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Invalid request body',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          409: {
            description: 'Email already in use',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive an access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/AuthTokenResponse' } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clear the refresh token cookie',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Logged out',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
          204: { description: 'No refresh token cookie was present' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Exchange the refresh token cookie for a new access token',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Token refreshed',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: { accessToken: { type: 'string' } },
                          required: ['accessToken'],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing refresh token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          403: {
            description: 'Invalid refresh token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } }, required: ['user'] } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/auth/users': {
      get: {
        tags: ['Auth'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          403: {
            description: 'Admin access required',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/leads': {
      get: {
        tags: ['Leads'],
        summary: 'List leads with filters and pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 }, example: 1 },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 }, example: 10 },
          { name: 'status', in: 'query', schema: { type: 'string', enum: leadStatusEnum } },
          { name: 'source', in: 'query', schema: { type: 'string', enum: leadSourceEnum } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['oldest', 'name_asc', 'name_desc'] } },
        ],
        responses: {
          200: {
            description: 'Leads fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/LeadListResponse' } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      post: {
        tags: ['Leads'],
        summary: 'Create a lead',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateLeadRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Lead created',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Lead' } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          409: {
            description: 'Lead email already exists',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/leads/{id}': {
      get: {
        tags: ['Leads'],
        summary: 'Get a lead by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Lead fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Lead' } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          404: {
            description: 'Lead not found or unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      patch: {
        tags: ['Leads'],
        summary: 'Update a lead',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateLeadRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Lead updated',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Lead' } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          404: {
            description: 'Lead not found or unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      delete: {
        tags: ['Leads'],
        summary: 'Delete a lead',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Lead deleted',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          403: {
            description: 'Admin access required',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          404: {
            description: 'Lead not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/analytics/overview': {
      get: {
        tags: ['Analytics'],
        summary: 'Get analytics overview',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Analytics overview fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/AnalyticsOverview' } } },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid access token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
} as const;

export { swaggerSpec };
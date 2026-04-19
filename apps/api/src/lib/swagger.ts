import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlowSpace API',
      version: '1.0.0',
      description: 'Project management backend API',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
      },
    ],

    tags: [
      { name: 'Auth' },
      { name: 'Workspaces' },
      { name: 'Projects' },
      { name: 'Tasks' },
      { name: 'Comments' },
      { name: 'Labels' },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
            },
            priority: {
              type: 'string',
              enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
            },
            projectId: { type: 'string' },
            workspaceId: { type: 'string' },
            creatorId: { type: 'string' },
            assigneeId: { type: 'string' },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: [
    './src/modules/**/*.routes.ts',
    './dist/modules/**/*.routes.js',
  ],
}

export const swaggerSpec = swaggerJsdoc(options)
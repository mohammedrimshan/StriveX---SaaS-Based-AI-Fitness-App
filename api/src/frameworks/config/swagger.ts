import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

// Debug paths
const controllerPath = path.join(__dirname, '../interfaceAdapters/controllers/*.ts');
const controllerSubPath = path.join(__dirname, '../interfaceAdapters/controllers/**/*.ts');
const routePath = path.join(__dirname, '../routes/*.ts');
const routeSubPath = path.join(__dirname, '../routes/**/*.ts');

console.log('Swagger scanning controllers:', controllerPath);
console.log('Swagger scanning controller subdirectories:', controllerSubPath);
console.log('Swagger scanning routes:', routePath);
console.log('Swagger scanning route subdirectories:', routeSubPath);

// Debug: List files in directories
try {
  const controllerFiles = fs.readdirSync(path.join(__dirname, '../interfaceAdapters/controllers'));
  console.log('Files in controllers directory:', controllerFiles);
} catch (err) {
  console.error('Error reading controllers directory:', err);
}
try {
  const routeFiles = fs.readdirSync(path.join(__dirname, '../routes'));
  console.log('Files in routes directory:', routeFiles);
} catch (err) {
  console.error('Error reading routes directory:', err);
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StriveX Fitness API',
      version: '1.0.0',
      description: 'API documentation for the StriveX fitness platform with clean architecture',
    },
    servers: [
      {
        url: 'http://localhost:5001/api/v1',
        description: 'Public API - Development Server',
      },
      {
        url: 'http://localhost:5001/api/v1/pvt',
        description: 'Private API - Development Server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Unique client ID' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phoneNumber: { type: 'string' },
            profileImage: { type: 'string' },
            fitnessGoal: {
              type: 'string',
              enum: ['weight_loss', 'muscle_gain', 'general_fitness', 'endurance', 'flexibility'],
            },
            preferredWorkout: {
              type: 'string',
              enum: ['cardio', 'strength', 'yoga', 'hiit', 'pilates'],
            },
            height: { type: 'number' },
            weight: { type: 'number' },
            status: { type: 'string', default: 'active' },
            experienceLevel: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
            },
            activityLevel: {
              type: 'string',
              enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
            },
            healthConditions: {
              type: 'array',
              items: { type: 'string' },
            },
            waterIntake: { type: 'number' },
            dietPreference: { type: 'string' },
            isPremium: { type: 'boolean', default: false },
            skillsToGain: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['strength', 'endurance', 'flexibility', 'balance', 'coordination'],
              },
            },
            selectionMode: {
              type: 'string',
              enum: ['auto', 'manual'],
              default: 'manual',
            },
            matchedTrainers: {
              type: 'array',
              items: { type: 'string' },
            },
            selectedTrainerId: { type: 'string' },
            selectStatus: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected'],
              default: 'pending',
            },
            isOnline: { type: 'boolean', default: false },
          },
        },
        Trainer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            specialization: { type: 'string' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../interfaceAdapters/controllers/*.ts'),
    path.join(__dirname, '../interfaceAdapters/controllers/**/*.ts'),
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/**/*.ts'),
  ],
};

let swaggerSpec: any;

try {
  swaggerSpec = swaggerJsdoc(options);
  console.log('Swagger spec generated successfully');
} catch (error) {
  console.error('Error generating Swagger spec:', error);
  swaggerSpec = {};
}

export { swaggerSpec };